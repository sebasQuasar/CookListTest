import { Constants, Methods, Providers } from '../types'
import { walmartConstants, walmartMethods } from "../providers"

export const ScrapperFactory = (provider?: Providers) => ({
  getMethods(): Methods {
    switch (provider) {
      case Providers.WALMART:
        return walmartMethods()
      default:
        return walmartMethods()
    }
  },
  getConstants(): Constants {
    switch (provider) {
      case Providers.WALMART:
        return walmartConstants
      default:
        return walmartConstants
    }
  }
})
