import { CartModel } from "./cart.model";
import { ConversationModel } from "./conversation.model";
import { PostModel } from "./post.model";
import { SaleModel } from "./sale.model";
import { UserModel } from "./user.model";

export type AppModel = UserModel | PostModel | CartModel | SaleModel | ConversationModel;