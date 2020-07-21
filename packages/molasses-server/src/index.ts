import axios, { AxiosInstance, AxiosResponse } from "axios"
import { Feature, User, isActive } from "@molassesapp/common"

export type Options = {
  APIKey: string
  URL: string
  Debug: boolean
}

export class MolassesClient {
  private options: Options = {
    APIKey: "",
    URL: "https://www.molasses.app",
    Debug: false,
  }

  private featuresCache: {
    [key: string]: Feature
  } = {}

  private initiated: boolean = false
  private etag: string = ""
  private axios?: AxiosInstance
  private refreshInterval = 15000 // 15 seconds
  private timer: NodeJS.Timer | undefined

  constructor(options: Options) {
    this.options = { ...this.options, ...options }
    if (this.options.APIKey == "") {
      throw new Error("API KEY is required for Molasses to start")
    }
    this.axios = axios.create({
      baseURL: this.options.URL,
    })
  }

  init = () => {
    return this.fetchFeatures()
  }

  private timedFetch() {
    if (this.refreshInterval != null && this.refreshInterval > 0) {
      this.timer = setTimeout(() => this.fetchFeatures(), this.refreshInterval)
    }
  }

  stop() {
    if (this.timer) {
      clearTimeout(this.timer)
    }
  }

  isActive(key: string, user?: User) {
    if (!this.initiated) {
      return false
    }
    return isActive(this.featuresCache[key], user)
  }

  private fetchFeatures = () => {
    const headers = { Authorization: "Bearer " + this.options.APIKey }
    if (this.etag) {
      headers["If-None-Match"] = this.etag
    }
    return this.axios
      .get("/v1/sdk/features", {
        headers,
      })
      .then((response: AxiosResponse) => {
        this.timedFetch()
        if (response.status == 304) {
          return void 0
        }

        if (response.data && response.data.data) {
          const jsonData: Feature[] = response.data.data
          this.featuresCache = jsonData.reduce<{ [key: string]: Feature }>(
            (acc, value: Feature) => {
              acc[value.key] = value
              return acc
            },
            {},
          )
          this.etag = response.headers["etag"]
          this.initiated = true
        }
        return void 0
      })
      .catch((err: Error) => {
        this.timedFetch()
        throw err
      })
  }
}
