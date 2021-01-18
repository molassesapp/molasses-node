import axios, { AxiosInstance, AxiosResponse } from "axios"
import { Feature, User, isActive } from "@molassesapp/common"
const EventSource = require("eventsource")
const winston = require("winston")
/** Options for the `MolassesClient` - APIKey is required */
export type Options = {
  /** Sets the API Key to be used in calls to Molasses*/
  APIKey: string
  /** The based url to be used to call Molasses  */
  URL?: string
  /** When set to true it starts debug mode */
  debug?: boolean
  /** Whether to send user event data back for reporting */
  autoSendEvents?: boolean
  /** Whether to use the streaming api or the base url */
  streaming?: boolean
  refreshInterval?: number
  maxDelay?: number
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
    URL: "https://sdk.molasses.app/v1",
    debug: false,
    autoSendEvents: false,
    streaming: true,
    refreshInterval: 15000,
    maxDelay: 64000,
  }

  private featuresCache: {
    [key: string]: Feature
  } = {}

  private initiated: boolean = false
  private etag: string = ""
  private axios?: AxiosInstance
  private timer: NodeJS.Timer | undefined
  private retryCount = 0
  private logger: any
  private eventStream: any
  /**
   * Creates a new MolassesClient.
   * @param  {Options} options - the settings for the MolassesClient
   */
  constructor(options: Options) {
    this.options = { ...this.options, ...options }
    if (this.options.APIKey == "") {
      throw new Error("API KEY is required for Molasses to start")
    }
    this.logger = winston.createLogger({
      level: this.options.debug ? "debug" : "info",
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format((info) => {
              info.message = `[Molasses] ${info.message ? info.message : ""}`
              return info
            })(),
            winston.format.timestamp(),
            winston.format.simple(),
          ),
        }),
      ],
    })
    this.axios = axios.create({
      validateStatus: function (status) {
        return (status >= 200 && status < 300) || status == 304 // allow for 304
      },
      baseURL: this.options.URL,
    })
  }

  scheduleReconnect() {
    let scheduledTime = 1000 * this.retryCount * 2
    if (scheduledTime === 0) {
      scheduledTime = 1000
    } else if (scheduledTime >= 64000) {
      scheduledTime = 64000
    }
    scheduledTime = scheduledTime - Math.trunc(Math.random() * 0.3 * scheduledTime)
    this.retryCount = this.retryCount + 1
    setTimeout(() => {
      this.logger.info("reconnecting - retry count:" + this.retryCount)
      this.setupEventSource()
    }, scheduledTime)
  }

  setupEventSource() {
    return new Promise((resolve, reject) => {
      const headers = { Authorization: "Bearer " + this.options.APIKey }
      this.eventStream = new EventSource(this.options.URL + "/event-stream", {
        headers,
      } as any)

      this.eventStream.onmessage = (e) => {
        try {
          const result = JSON.parse(e.data)
          if (result.data?.features) {
            this.logger.info("received feature update")
            const jsonData: Feature[] = result.data.features
            this.featuresCache = jsonData.reduce<{ [key: string]: Feature }>(
              (acc, value: Feature) => {
                acc[value.key] = value
                return acc
              },
              {},
            )
            this.initiated = true
            this.retryCount = 0
            resolve(void 0)
          } else {
            reject("Molasses - invalid message format")
          }
        } catch (error) {
          reject("Molasses - invalid message format")
        }
      }
      this.eventStream.onerror = (err: any) => {
        if (err.status === 401 || err.status === 403) {
          this.logger.error("not authorized! failed to connect")
          this.eventStream.close()
          reject("Molasses not authorized! failed to connect")
        } else {
          this.eventStream.close()
          this.scheduleReconnect()
          this.logger.error("ERROR - " + err.message)
          reject("Molasses - ERROR - " + err.message)
        }
      }
    })
  }
  /**
   * `init` - Initializes the feature flags by fetching them from the Molasses Server
   * */
  init() {
    this.logger.info("Starting Molasses")
    if (this.options.streaming) {
      return this.setupEventSource()
    }
    return this.fetchFeatures()
  }

  private timedFetch() {
    this.timer = setTimeout(() => this.fetchFeatures(), this.options.refreshInterval)
  }

  /** Stops any polling by the molasses client */
  stop() {
    if (this.options.streaming) {
      this.eventStream.close()
    } else {
      clearTimeout(this.timer)
    }
  }

  /**
   * Checks to see if a feature is active for a user.
   * A `User` is optional. If no user is passed, it will check if the feature is fully available for a user.
   * However, if no user is passed and the identify call is in place it will use that user to evaluate
   * @param {string} key  - the name of the feature flag
   * @param {User} user - The user that the feature flag will be evaluated against.
   */
  isActive(key: string, user?: User, defaultValue = false) {
    if (!this.initiated) {
      return false
    }

    const feature = this.featuresCache[key]
    if (!feature) {
      this.logger.warn(`Molasses - feature ${key} doesn't exist in your environment`)
      return defaultValue
    }
    const result = isActive(feature, user)
    if (user && this.options.autoSendEvents) {
      this.uploadEvent({
        event: "experiment_started",
        tags: user.params,
        userId: user.id,
        featureId: feature.id,
        featureName: key,
        testType: result ? "experiment" : "control",
      }).catch(() => {
        this.logger.error("failed to upload experiment started")
      })
    }
    return result
  }

  /**
   * Sends a tracking event when a user starts an A/B test. This can include additional metadata.
   * @param {string} key  - the name of the feature flag
   * @param {Object} additionalDetails - additonal metadata for the event
   * @param {User} [user] - The user that the feature flag will be evaluated against.
   */
  experimentStarted(key: string, additionalDetails: { [key: string]: string }, user: User) {
    if (!this.initiated || !user || !user.id) {
      return false
    }

    const feature = this.featuresCache[key]
    if (!feature) {
      this.logger.warn(`Molasses - feature ${key} doesn't exist in your environment`)
      return false
    }
    const result = isActive(feature, user)
    return this.uploadEvent({
      event: "experiment_started",
      tags: {
        ...user.params,
        ...additionalDetails,
      },
      userId: user.id,
      featureId: feature.id,
      featureName: key,
      testType: result ? "experiment" : "control",
    }).catch(() => {
      this.logger.error("failed to upload experiment success")
    })
  }
  /**
   * Sends a success event when a user completes the goal of an A/B test. This can include additional metadata.
   * @param {string} key  - the name of the feature flag
   * @param {Object} additionalDetails - additonal metadata for the event
   * @param {User} [user] - The user that the feature flag will be evaluated against.
   */
  experimentSuccess(key: string, additionalDetails: { [key: string]: string }, user: User) {
    if (!this.initiated || !user || !user.id) {
      return false
    }

    const feature = this.featuresCache[key]
    if (!feature) {
      this.logger.warn(`Molasses - feature ${key} doesn't exist in your environment`)
      return false
    }
    const result = isActive(feature, user)
    return this.uploadEvent({
      event: "experiment_success",
      tags: {
        ...user.params,
        ...additionalDetails,
      },
      userId: user.id,
      featureId: feature.id,
      featureName: key,
      testType: result ? "experiment" : "control",
    }).catch(() => {
      this.logger.error("failed to upload experiment success")
    })
  }

  private uploadEvent(eventOptions: EventOptions) {
    const headers = { Authorization: "Bearer " + this.options.APIKey }
    const data = {
      ...eventOptions,
      tags: JSON.stringify(eventOptions.tags),
    }
    return this.axios.post("/analytics", data, {
      headers,
    })
  }

  private fetchFeatures() {
    const headers = { Authorization: "Bearer " + this.options.APIKey }
    if (this.etag) {
      headers["If-None-Match"] = this.etag
    }
    return this.axios
      .get("/features", {
        headers,
      })
      .then((response: AxiosResponse) => {
        this.timedFetch()
        if (response.status == 304) {
          return true
        }

        if (response.data && response.data.data && response.data.data.features) {
          const jsonData: Feature[] = response.data.data.features
          this.featuresCache = jsonData.reduce<{ [key: string]: Feature }>(
            (acc, value: Feature) => {
              acc[value.key] = value
              return acc
            },
            {},
          )
          this.logger.info("received feature update")
          this.etag = response.headers["etag"]
          this.initiated = true
        }
        return true
      })
      .catch((err: Error) => {
        if (!this.initiated) {
          throw new Error("Molasses - " + err.message)
        }
        this.logger.error(err.message)
        this.timedFetch()
      })
  }
}
