import axios, { AxiosInstance, AxiosResponse } from "axios"
import { Feature, User, isActive } from "@molassesapp/common"

/** Options for the `MolassesClient` - APIKey is required */
export type Options = {
  /** Sets the API Key to be used in calls to Molasses*/
  APIKey: string
  /** The based url to be used to call Molasses  */
  URL?: string
  /** When set to true it starts debug mode */
  debug?: boolean
  /** Whether to send user event data back for reporting. Defaults to true */
  sendEvents?: boolean
  /** Where to store the feature data -- defaults to `memory`. `localstorage` allows for user backup*/
  storage?: "localstorage" | "memory"
}

type EventOptions = {
  featureId: string
  userId: string
  featureName: string
  event: "experiment_started" | "experiment_success"
  tags?: { [key: string]: string }
  testType?: string
}

export class MolassesClient {
  private options: Options = {
    APIKey: "",
    URL: "https://us-central1-molasses-36bff.cloudfunctions.net",
    debug: false,
    sendEvents: true,
  }

  private featuresCache: {
    [key: string]: Feature
  } = {}

  private initiated: boolean = false
  private axios?: AxiosInstance
  private user?: User
  /**
   * Creates a new MolassesClient.
   * @param  {Options} options - the settings for the MolassesClient
   */
  constructor(options: Options) {
    this.options = { ...this.options, ...options }
    if (this.options.APIKey == "") {
      throw new Error("API KEY is required for Molasses to start")
    }
    this.axios = axios.create({
      baseURL: this.options.URL,
    })
  }

  /**
   * `init` - Initializes the feature flags by fetching them from the Molasses Server
   * */
  init() {
    return this.fetchFeatures()
  }

  /** `reinit` - Reinitializes the feature flags by refetching them from the Molasses Server*/
  reinit() {
    return this.fetchFeatures()
  }

  /**
   * The `identify` call sets the default `User`. This user will be used when calling `isActive` or `event` calls
   * @param {User} user - The user that will be used
   * */
  identify(user: User) {
    this.user = user
  }

  /**
   * `resetUser` sets the default `User` back to undefined so you can call `identify` again or call `isActive` anonymously
   */
  resetUser() {
    this.user = undefined
  }
  /**
   * Checks to see if a feature is active for a user.
   * A `User` is optional. If no user is passed, it will check if the feature is fully available for a user.
   * However, if no user is passed and the identify call is in place it will use that user to evaluate
   * @param {string} key  - the name of the feature flag
   * @param {User} [user] - The user that the feature flag will be evaluated against.
   */
  isActive(key: string, user?: User) {
    if (!this.initiated) {
      return false
    }

    if (!user && this.user) {
      user = this.user
    }

    const feature = this.featuresCache[key]
    const result = isActive(feature, user)
    if (user && this.options.sendEvents) {
      this.uploadEvent({
        event: "experiment_started",
        tags: user.params,
        userId: user.id,
        featureId: feature.id,
        featureName: key,
        testType: result ? "experiment" : "control",
      })
    }
    return result
  }

  /**
   * Sends a success event when a user completes the goal of an A/B test. This can include additional metadata.
   * @param {string} key  - the name of the feature flag
   * @param {Object} additionalDetails - additonal metadata for the event
   * @param {User} [user] - The user that the feature flag will be evaluated against.
   */
  experimentSuccess(key: string, additionalDetails: { [key: string]: string }, user?: User) {
    if (!this.initiated || !this.options.sendEvents) {
      return false
    }

    if (!user && this.user) {
      user = this.user
    }

    if (user && key != "") {
      const feature = this.featuresCache[key]
      const result = isActive(feature, user)
      this.uploadEvent({
        event: "experiment_success",
        tags: {
          ...user.params,
          ...additionalDetails,
        },
        userId: user.id,
        featureId: feature.id,
        featureName: key,
        testType: result ? "experiment" : "control",
      })
    }
  }

  private uploadEvent(eventOptions: EventOptions) {
    const headers = { Authorization: "Bearer " + this.options.APIKey }
    const data = {
      ...eventOptions,
      tags: JSON.stringify(eventOptions.tags),
    }
    this.axios.post("/analytics", data, {
      headers,
    })
  }

  private fetchFeatures() {
    const headers = { Authorization: "Bearer " + this.options.APIKey }
    return this.axios
      .get("/get-features", {
        headers,
      })
      .then((response: AxiosResponse) => {
        if (response.data && response.data.data && response.data.data.features) {
          const jsonData: Feature[] = response.data.data.features
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
        throw new Error("Molasses - " + err.message)
      })
  }
}
