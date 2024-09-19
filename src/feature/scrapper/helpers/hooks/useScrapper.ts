import { useState } from 'react'
import { ScrapperInstance } from '../../core'
import { ScrapperHookReturn } from '../../types/hooks'
import { WebViewMessageEvent } from 'react-native-webview'


export const useScrapper = (): ScrapperHookReturn => {
    const [url, setUrl] = useState<string>(ScrapperInstance.constants.LOGIN_URL)

    const getSessionStatus = async () => {
        ScrapperInstance.getSession()
            .then((response) => {
                !!response?.isAuthenticated && setUrl(ScrapperInstance.constants.ODERS_URL)
            })
            .catch((error) => {
                console.error('Error getting session', error)
            })
    }

    const onBridgeEvent = (event: WebViewMessageEvent) => {
        ScrapperInstance.onBridgeEvent(event)
        ScrapperInstance.getOrders()
    }

    return {
        url,
        getSessionStatus,
        jsInjection: ScrapperInstance.getJavascriptCodeToInject(),
        configs: ScrapperInstance.getConfigNames(),
        onBridgeEvent,
    }
}
