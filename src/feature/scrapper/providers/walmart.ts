import { Constants, Methods } from '../types'
import CookieManager from '@react-native-cookies/cookies'
import { OrderHistoryRespose } from '../types/api'

export const walmartConstants: Constants = {
    BASE_URL: 'https://www.walmart.com',
    LOGIN_URL: 'https://www.walmart.com/account/login?vid=oaoh&tid=0&returnUrl=/orders',
    ODERS_URL: 'https://www.walmart.com/orders',
    ORDERS_PATH: '/orders',
    ORDER_DETAILS: '/orders/*',
}

export const walmartMethods = (): Methods => {
    return {
        async getSession() {
            try {
                const cookies = await CookieManager.get(walmartConstants.BASE_URL, true)
                const isAuthenticated = Boolean(cookies['customer'])
                console.log(`# LOGGED ${isAuthenticated ? 'IN' : 'OUT'} #`)
                return { isAuthenticated, cookies }
            } catch (e) {
               Promise.reject('Cookies Failed')
            }
        },
        getJavascriptCodeToInject() {
            return `
                window.onload = () => {
                    // Function to extract and send query configuration by name
                    const sendQueryConfigByName = (queryName) => {
                        for (const [chunkId, modules] of self.webpackChunk_N_E) {
                            for (const [moduleId, moduleFactory] of Object.entries(modules)) {
                                const moduleContent = moduleFactory.toString();
                                const queryConfigPattern = new RegExp(\`({type:"[^"]*",name:"\${queryName}",query:"[^"]*",hash:"[^"]*"})\`, 'g');
                                const match = queryConfigPattern.exec(moduleContent)?.[1];
                                if (match) {
                                    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'queryConfig', data: match }));
                                return;
                                }
                            }
                        }
                    };

                    // Function to process all query configurations specified in the injected JSON object
                    const processQueryConfigs = () => {
                        const injectedJsonString = window.ReactNativeWebView.injectedObjectJson();
                        if (!injectedJsonString) return;

                        try {
                            const queryNames = JSON.parse(injectedJsonString);
                            queryNames.forEach(queryName => sendQueryConfigByName(queryName));
                        } catch (error) {
                            console.error('Failed to parse injected JSON:', error);
                        }
                    };

                    if (window.location.pathname.includes('orders')) {
                        // Click on the first 'viewDetails' button
                        document.querySelector('[link-identifier^="viewDetails"]')?.click();

                        // Delay execution to wait for the new content to load
                        setTimeout(() => {
                            const nextDataScriptContent = document.querySelector('script#__NEXT_DATA__')?.textContent;
                            if (nextDataScriptContent) {
                                try {
                                    const nextData = JSON.parse(nextDataScriptContent);
                                    const runtimeConfig = nextData.runtimeConfig;
                                    if (runtimeConfig) {
                                        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'runtimeConfig', data: JSON.stringify(runtimeConfig) }));
                                    }
                                } catch (error) {
                                    console.error('Failed to parse __NEXT_DATA__ script content:', error);
                                }
                            }

                            // Process query configurations after runtime config has been sent
                            processQueryConfigs();
                        }, 500);
                    }
                };
            `;
        },
        getConfigNames() {
            return ['getOrder', 'PurchaseHistoryV2']
        },
        onBridgeEvent({ nativeEvent: { data: messageDataString } }, configs) {
            try {
              const {type, data} = JSON.parse(messageDataString)
              if (type === 'runtimeConfig') {
                return { [type]: JSON.parse(data), ...(configs ?? {}) }
              } else if (type === 'queryConfig') {
                const queryConfig = eval(`const a=${data}; a;`)
                if (configs && 'queryConfig' in configs) {
                    return { ...configs, [type]: [...configs['queryConfig'], queryConfig] }
                }
                return { [type]: [queryConfig], ...(configs ?? {}) }
              }
              return
            } catch (error) {
              console.error('Error handling bridge event', error)
              return
            }
        },
        async getOrders(pageNumber, configs = {}, commonHeaders = {}, baseUrl) {
            if ('queryConfig' in configs && 'runtimeConfig' in configs && baseUrl) {
                const queryConfig = configs['queryConfig'].find(
                    (qc: { name: string }) => qc.name === 'PurchaseHistoryV2',
                )

                if (!queryConfig && configs['queryConfig']?.length < 2) {
                    Promise.reject('Configs are missing')
                    return
                }
            
                const { name, query, hash } = queryConfig
                const headers: any = {
                    ...commonHeaders,
                    'X-APOLLO-OPERATION-NAME': name,
                }
                const {
                    queryContext: {
                        gql: {endpointsByName},
                    },
                    endpointMappings,
                } = configs['runtimeConfig']
                const ordersEndpoint = endpointsByName[endpointMappings.pages[walmartConstants.ORDERS_PATH]]
                const url = `${baseUrl}${ordersEndpoint}/${name}/${hash}`
                const body = JSON.stringify({
                    query,
                    variables: {
                        input: {
                            cursor: pageNumber ?? '',
                        },
                        platform: 'WEB',
                    },
                })
                
                try {
                    const result = await fetch(url, {
                        headers,
                        method: 'POST',
                        body,
                    })
                    const response = await result.json() as OrderHistoryRespose
                    const orderGroups = response.data.orderHistoryV2.orderGroups
                    const prevPageCursor = response.data.orderHistoryV2.pageInfo.prevPageCursor
                    const nextPageCursor = response.data.orderHistoryV2.pageInfo.nextPageCursor

                    
                    !prevPageCursor && console.log('# ORDER LIST #')

                    console.log(orderGroups)

                    for (const order of orderGroups) {
                        if (order.purchaseOrderId) {
                            await new Promise(resolve => setTimeout(resolve, 8000))
                            const orderDetail = await this.getOrderDetails(order?.orderId, configs, commonHeaders, baseUrl)
                            console.log('# ORDER DETAILS #')
                            console.log(orderDetail)
                        }
                        !nextPageCursor && console.log('# END OF ORDER LIST #')
                      }
                  
                    if (nextPageCursor) {
                        await new Promise(resolve => setTimeout(resolve, 1000))
                        this.getOrders(nextPageCursor, configs, commonHeaders, baseUrl)
                    }
                    
                } catch (err) {
                    Promise.reject('Error in getOrders')
                }            
            }
            Promise.reject('Configs are missing')
        },
        async getOrderDetails(params, configs = {}, commonHeaders = {}, baseUrl) {
            if ('queryConfig' in configs && 'runtimeConfig' in configs && baseUrl) {
                const queryConfig = configs['queryConfig'].find(
                    (qc: { name: string }) => qc.name === 'getOrder',
                )
        
                if (!queryConfig) {
                    Promise.reject('Configs are missing')
                    return
                }
            
                const { name, hash, query } = queryConfig
                const headers = {
                    ...commonHeaders,
                    'X-APOLLO-OPERATION-NAME': name,
                    query,
                }
                const {
                    queryContext: {
                        gql: {endpointsByName},
                    },
                    endpointMappings,
                } = configs['runtimeConfig']

                const urlQueryVariable = {
                    variables: JSON.stringify({ orderId: params }),
                }
                const orderDetailsEndpoint = endpointsByName[endpointMappings.pages[walmartConstants.ORDER_DETAILS]]
                const url = `${baseUrl}${orderDetailsEndpoint}/${name}/${hash}?${(new URLSearchParams(urlQueryVariable)).toString()}`

                try {
                    const result = await fetch(url, {
                        headers,
                        method: 'GET',
                    })
                    const response = await result.json()
                    return response?.data?.order
                } catch (error) {
                    console.error('Error in getOrderDetails.', error)
                }
            }
        },
    }
}
