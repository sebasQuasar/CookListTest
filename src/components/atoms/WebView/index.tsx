import React from 'react'
import { WebView, WebViewProps } from 'react-native-webview'
import { Container } from './styles'

export const CustomWebView: React.FC<WebViewProps> = (props) => {
    return (
        <Container>
            <WebView {...props} />
        </Container>
    )
}
