import React from 'react'
import { CustomWebView } from '../components'
import { useScrapper } from '../feature'

const Authentication: React.FC = () => {
    const {
        url,
        getSessionStatus,
        jsInjection,
        configs,
        onBridgeEvent,
    } = useScrapper()

    return (
        <CustomWebView
            source={{
                uri: url,
            }}
            useWebView2
            originWhitelist={['*']}
            injectedJavaScript={jsInjection}
            injectedJavaScriptObject={configs}
            onLoad={getSessionStatus}
            onMessage={onBridgeEvent}
        />
    )
}

export default Authentication
