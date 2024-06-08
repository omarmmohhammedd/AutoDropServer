import { Request, Response, NextFunction } from "express";
import WebHookEvents from "./WebHookEvents";

const events = new WebHookEvents();

export default function WebHookHandler(
  req: Request,
  res: Response,
  next: NextFunction,
  clients: any,WebSocket:any
  ) {
  try {
    const body = req.body;
    const { event ,...other} = body;
    console.log("WebHook: salla event triggred => ", event);

    switch (event) {
      case "app.store.authorize":
        return events.AuthorizeEvent(body, res, next);

      case "app.installed":
        return events.CreateNewApp(body, res, next);

      case "app.uninstalled":
        return events.RemoveApp(body, res, next);

      case "app.expired":

      case "app.updated":
      case "order.deleted":
        return events.DeleteSelectedOrder(body, res, next);
      case "order.created":
        return events.CreateNewOrder(body, res, next);
      case "order.status.updated":
        return events.UpdateOrderStatus(body, res, next);
      case "product.deleted":
        return events.DeleteSelectedProduct(body, res, next);
      case "order.deleted":
        return events.DeleteSelectedOrder(body, res, next);
      case 'app.subscription.renewed':
      case 'app.subscription.started':
        return events.makeSubscription(body, res, next,clients,WebSocket);
      case 'app.trial.started':
        return events.freeTrial(body,res)
      case 'app.trial.expired':
        return events.deleteFree(body,res)
      case 'app.subscription.expired':
        return events.deletePlan(body,res)
      case 'product.updated':
        return events.updateProduct(body,res)
      default:

        return true;
    }
  } catch (error: any) {
    console.log(error);
    next(error);
  }
}
