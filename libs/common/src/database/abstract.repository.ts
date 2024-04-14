import { Logger, NotFoundException } from "@nestjs/common";
import { FilterQuery, Model, Types, UpdateQuery } from "mongoose";
import { AbstractDocument } from "./abstract.schema";

export abstract class AbstractRepository<TDocumnet extends AbstractDocument> {
    protected abstract readonly logger: Logger;

    constructor(protected readonly model: Model<TDocumnet>) {}

    async create(document: Omit<TDocumnet, '_id'>): Promise<TDocumnet> {
        const createDocument = new this.model({
            ...document,
            _id: new Types.ObjectId(),
        });
        return (await createDocument.save()).toJSON() as unknown as TDocumnet;
    }

    async findOne(filterQuery: FilterQuery<TDocumnet>): Promise<TDocumnet> {
        const document = await this.model.findOne(filterQuery, {}, { lean: true });
        
        if(!document) {
            this.logger.warn('Document not found with filterQuery', filterQuery);
            throw new NotFoundException('Document not found!');
        }
        
        return document as TDocumnet;
    }

    async findOneAndUpdate(filterQuery: FilterQuery<TDocumnet>, update: UpdateQuery<TDocumnet>,) {
        const document = await this.model.findOneAndUpdate(filterQuery, update, {
            lean: true,
            new: true,
        });

        if(!document) {
            this.logger.warn('Document not found with filterQuery', filterQuery);
            throw new NotFoundException('Document not found!');
        }

        return document
    }

    async find(filterQuery: FilterQuery<TDocumnet>) {
        return this.model.find(filterQuery, {}, { lean: true });
    }

    async findOneAndDelete(filterQuery: FilterQuery<TDocumnet>) {
        return this.model.findOneAndDelete(filterQuery, { lean: true });
    }

}