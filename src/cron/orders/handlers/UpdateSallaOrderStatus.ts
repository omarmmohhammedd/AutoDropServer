import SallaRequest from "../../../utils/handlers/SallaRequest";

export type SallaOrderStatus =
  | "payment_pending"
  | "under_review"
  | "in_progress"
  | "completed"
  | "delivering"
  | "delivered"
  | "shipped"
  | "canceled"
  | "restoring"
  | "restored";

export async function UpdateSalaOrderStatus(
  status: SallaOrderStatus,
  order_id: string,
  token: string
) {
  const URL = "orders/" + order_id + "/status";
  try {
    return SallaRequest({
      url: URL,
      method: "post",
      data: { slug: status },
      token,
    });
  } catch (error) {
    
  }

}
