import { WebViewMessageEvent } from 'react-native-webview'
import { Constants, Methods } from '../types'
import { ScrapperFactory } from './factory'
import { Cookies } from '@react-native-cookies/cookies'

export class Scrapper implements Methods {
    methods: Methods
    constants: Constants
    configs: { [key: string]: any }
    cookies?: Cookies
    baseUrl?: string
    commonHeaders?: { [key: string]: any }


    constructor() {
        this.methods = ScrapperFactory().getMethods()
        this.constants = ScrapperFactory().getConstants()
        this.configs = {}
    }
    async getOrderDetails() {
        return this.methods.getOrderDetails('', this.configs, this.commonHeaders, this.baseUrl)
    }

    async getSession() {
        const session = await this.methods.getSession()
        if (session?.cookies) {
            this.setCookies(session?.cookies)
        }
        return session
    }

    async getOrders() {
        return this.methods.getOrders('', this.configs, this.commonHeaders, this.baseUrl)
    }

    getJavascriptCodeToInject() {
       return this.methods.getJavascriptCodeToInject()
    }

    getConfigNames() {
        return this.methods.getConfigNames() 
    }

    onBridgeEvent(event: WebViewMessageEvent) {
        const configs = this.methods.onBridgeEvent(event, this.configs)
        if (configs) {
            this.setConfigs(configs)
        }
        return configs
    }

    setCookies(cookies: Cookies) {
        this.cookies = cookies
    }

    setConfigs(configs: { [key: string]: any }) {
        this.configs = configs
        if ('runtimeConfig' in this.configs && this.cookies) {
            const {
                appVersion,
                tenantV2: { bu, mart },
                vid,
                host: { wmt },
            } = this.configs['runtimeConfig']
            
            const cookieHeaderValue = Object.entries(this.cookies)
                .map(c => `${c[0]}=${(c[1] as any).value}`)
                .join('; ')
          
            this.commonHeaders = {
                'accept': 'application/json',
                'accept-language': 'en-US',
                'baggage': 'trafficType=customer,deviceType=mobile,renderScope=CSR,webRequestSource=Browser,pageName=yourOrders,isomorphicSessionId=SRpcllOd4qLeyRxEpXIGN',
                'content-type': 'application/json',
                'x-o-bu': bu,
                'x-o-mart': mart,
                'x-o-platform-version': appVersion,
                'x-o-platform': 'rweb',
                'x-o-segment': vid,
                'cookie': cookieHeaderValue,
            }
    
            this.baseUrl = `${wmt}`
        }
    }
}

const ScrapperInstance = new Scrapper()

export { ScrapperInstance }
