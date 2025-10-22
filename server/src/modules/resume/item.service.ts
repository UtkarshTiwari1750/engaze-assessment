import prisma from "../../config/prisma";
import {
  CreateItemDto,
  UpdateItemDto,
  ReorderItemsDto,
  SectionItemResponseDto,
} from "../../types/dtos";
import { NotFoundError } from "../../middleware/error.middleware";

export class ItemService {
  async createItem(
    userId: number,
    resumeId: number,
    sectionId: number,
    data: CreateItemDto
  ): Promise<SectionItemResponseDto> {
    // Verify section ownership
    const section = await prisma.resumeSection.findFirst({
      where: {
        id: sectionId,
        resume: {
          id: resumeId,
          userId,
        },
      },
    });

    if (!section) {
      throw new NotFoundError("Section not found");
    }

    // Get next position
    let position = data.position;
    if (position === undefined) {
      const lastItem = await prisma.sectionItem.findFirst({
        where: { sectionId },
        orderBy: { position: "desc" },
      });
      position = (lastItem?.position || 0) + 1;
    }

    const item = await prisma.sectionItem.create({
      data: {
        sectionId,
        position,
        dataJson: data.dataJson,
      },
    });

    return {
      id: item.id,
      position: item.position,
      dataJson: item.dataJson,
    };
  }

  async updateItem(
    userId: number,
    resumeId: number,
    sectionId: number,
    itemId: number,
    data: UpdateItemDto
  ): Promise<SectionItemResponseDto> {
    // Verify ownership
    const item = await prisma.sectionItem.findFirst({
      where: {
        id: itemId,
        section: {
          id: sectionId,
          resume: {
            id: resumeId,
            userId,
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundError("Item not found");
    }

    const updatedItem = await prisma.sectionItem.update({
      where: { id: itemId },
      data: {
        ...(data.dataJson && { dataJson: data.dataJson }),
      },
    });

    return {
      id: updatedItem.id,
      position: updatedItem.position,
      dataJson: updatedItem.dataJson,
    };
  }

  async deleteItem(
    userId: number,
    resumeId: number,
    sectionId: number,
    itemId: number
  ): Promise<void> {
    // Verify ownership
    const item = await prisma.sectionItem.findFirst({
      where: {
        id: itemId,
        section: {
          id: sectionId,
          resume: {
            id: resumeId,
            userId,
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundError("Item not found");
    }

    await prisma.$transaction(async (tx) => {
      // Delete item
      await tx.sectionItem.delete({
        where: { id: itemId },
      });

      // Reorder remaining items
      await tx.sectionItem.updateMany({
        where: {
          sectionId,
          position: {
            gt: item.position,
          },
        },
        data: {
          position: {
            decrement: 1,
          },
        },
      });
    });
  }

  async reorderItems(
    userId: number,
    resumeId: number,
    sectionId: number,
    data: ReorderItemsDto
  ): Promise<void> {
    // Verify section ownership
    const section = await prisma.resumeSection.findFirst({
      where: {
        id: sectionId,
        resume: {
          id: resumeId,
          userId,
        },
      },
    });

    if (!section) {
      throw new NotFoundError("Section not found");
    }

    // Update positions in transaction
    await prisma.$transaction(async (tx) => {
      for (const item of data.items) {
        await tx.sectionItem.updateMany({
          where: {
            id: item.id,
            sectionId,
          },
          data: {
            position: item.position,
          },
        });
      }
    });
  }
}
