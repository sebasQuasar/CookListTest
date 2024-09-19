import { WebViewMessageEvent } from "react-native-webview"

export type ScrapperHookReturn = {
    url: string
    getSessionStatus: () => {}
    jsInjection: string
    configs: string[]
    onBridgeEvent: (event: WebViewMessageEvent) => void
}
 