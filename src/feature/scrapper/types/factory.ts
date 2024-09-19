import { Cookies } from '@react-native-cookies/cookies'
import { WebViewMessageEvent } from 'react-native-webview'

export enum Providers {
    WALMART = 'walmart',
}

export interface Methods {
    getSession(): Promise<{ isAuthenticated?: Boolean, cookies: Cookies } | undefined>
    getJavascriptCodeToInject(): string
    getConfigNames(): string[]
    onBridgeEvent: (event: WebViewMessageEvent, configs?: { [key: string]: any }) => { [key: string]: any } | undefined
    getOrders: (pageNumber?: string, configs?: { [key: string]: any }, commonHeaders?: { [key: string]: any }, baseUrl?: string) => Promise<void>
    getOrderDetails: (params: any, configs?: { [key: string]: any }, commonHeaders?: { [key: string]: any }, baseUrl?: string) => Promise<void>
}

export type Constants = {
    BASE_URL: string
    LOGIN_URL: string
    ODERS_URL: string
    ORDERS_PATH: string
    ORDER_DETAILS: string
}
