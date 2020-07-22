import axios, { AxiosInstance, AxiosResponse } from "axios"
import { Feature, User, isActive } from "@molassesapp/common"

export type Options = {
  APIKey: string
  URL?: string
  Debug?: boolean
}

export default class MolassesClient {
  private options: Options = {
    APIKey: "",
    URL: "https://www.molasses.app",
    Debug: false,
  }

  private featuresCache: {
    [key: string]: Feature
  } = {}

  private initiated: boolean = false
  private axios?: AxiosInstance
  private user?: User
  constructor(options: Options) {
    this.options = { ...this.options, ...options }
    if (this.options.APIKey == "") {
      throw new Error("API KEY is required for Molasses to start")
    }
    this.axios = axios.create({
      baseURL: this.options.URL,
    })
  }

  init() {
    return this.fetchFeatures()
  }

  identify(user: User) {
    this.user = user
  }

  resetUser() {
    this.user = undefined
  }

  isActive(key: string, user?: User) {
    if (!this.initiated) {
      return false
    }

    if (!user && this.user) {
      user = this.user
    }

    return isActive(this.featuresCache[key], user)
  }

  private fetchFeatures() {
    const headers = { Authorization: "Bearer " + this.options.APIKey }
    return this.axios
      .get("/v1/sdk/features", {
        headers,
      })
      .then((response: AxiosResponse) => {
        if (response.data && response.data.data) {
          const jsonData: Feature[] = response.data.data
          this.featuresCache = jsonData.reduce<{ [key: string]: Feature }>(
            (acc, value: Feature) => {
              acc[value.key] = value
              return acc
            },
            {},
          )
          this.initiated = true
        }
        return true
      })
      .catch((err: Error) => {
        throw err
      })
  }
}
