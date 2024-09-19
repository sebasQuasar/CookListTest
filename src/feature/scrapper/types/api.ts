export type OrderGroup = {
    orderId: string
    groupId: string
    purchaseOrderId: string | null
}
  
export type OrderHistory = OrderGroup[]

export type OrderHistoryData = {
    pageInfo: {
        nextPageCursor: string | null
        prevPageCursor: string | null
    }
    orderGroups: OrderHistory
}
  
export type OrderHistoryRespose = {
    data: {
        orderHistoryV2: OrderHistoryData;
    }
}
