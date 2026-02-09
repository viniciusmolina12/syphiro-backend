import { Instance, InstanceId } from "../instance.aggregate";

export interface IInstanceRepository {
    findById(id: InstanceId): Promise<Instance>;
    existsById(id: InstanceId): Promise<boolean>;
}