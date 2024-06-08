"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateOrderTracking = void 0;
function UpdateOrderTracking(status, order) {
    let obj;
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
exports.UpdateOrderTracking = UpdateOrderTracking;
