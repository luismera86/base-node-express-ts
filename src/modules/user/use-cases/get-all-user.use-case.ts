import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";
import { Paginated, PaginationQueryDto, paginate, skipOf } from "../../../common/schemas/pagination.schema";

const logger = new LoggerService("GetAllUserUseCase");

export const getAllUsers = async (query: PaginationQueryDto): Promise<Paginated<unknown>> => {
    try {
        const where = { deleted_at: null };
        const [items, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip: skipOf(query),
                take: query.limit,
                orderBy: { created_at: query.order },
            }),
            prisma.user.count({ where }),
        ]);
        return paginate(items, total, query);
    } catch (error: unknown) {
        logger.error("Error getting all users", (error as Error).message);
        throw error;
    }
};
