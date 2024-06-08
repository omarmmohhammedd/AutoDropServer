import { OrderDocument, StatusTrack, StatusType } from "../../../models/Order.model";

export function UpdateOrderTracking(status: StatusType, order: OrderDocument) {
    let obj: StatusTrack;
    const orderJSON = order.toJSON();
    const tracking = orderJSON.status_track;
  
    obj = {
      createdAt: new Date(),
      status,
    };
  
    if (!tracking.length) {
      return [obj];
    }
  
    return [...tracking, obj];
  }
  