/**
 * @jest-environment jsdom
 */
import { MolassesClient } from "../src"
import mockAxios from "jest-mock-axios"
import { Feature, SegmentType, Operator } from "@molassesapp/common"
const user = {
  id: "123",
  params: {
    isScaredUser: "false",
  },
}

jest.mock("eventsource")
const { sources } = require("eventsourcemock")
const response: {
  data: { features: Feature[] }
} = {
  data: {
    features: [
      {
        active: true,
        description: "foo",
        key: "FOO_TEST",
        segments: [
          {
            constraint: Operator.all,
            percentage: 100,
            segmentType: SegmentType.alwaysControl,
            userConstraints: [
              {
                userParam: "isScaredUser",
                operator: Operator.in,
                values: "true,maybe",
              },
            ],
          },
          {
            constraint: Operator.all,
            percentage: 100,
            segmentType: SegmentType.alwaysExperiment,
            userConstraints: [
              {
                userParam: "isBetaUser",
                operator: Operator.equals,
                values: "true",
              },
            ],
          },
          {
            constraint: Operator.all,
            percentage: 100,
            segmentType: SegmentType.everyoneElse,
            userConstraints: [],
          },
        ],
      },
    ],
  },
}

const responseB: {
  data: { features: Feature[] }
} = {
  data: {
    features: [
      {
        active: true,
        description: "foo",
        key: "FOO_TEST",
        segments: [
          {
            constraint: Operator.all,
            percentage: 100,
            segmentType: SegmentType.alwaysControl,
            userConstraints: [
              {
                userParam: "isScaredUser",
                operator: Operator.nin,
                values: "false,maybe",
              },
            ],
          },
          {
            constraint: Operator.all,
            percentage: 100,
            segmentType: SegmentType.alwaysExperiment,
            userConstraints: [
              {
                userParam: "isBetaUser",
                operator: Operator.doesNotEqual,
                values: "false",
              },
            ],
          },
          {
            constraint: Operator.all,
            percentage: 100,
            segmentType: SegmentType.everyoneElse,
            userConstraints: [],
          },
        ],
      },
    ],
  },
}
const validMessage = new MessageEvent("foo", {
  data: JSON.stringify(response),
})
const validMessageB = new MessageEvent("foo", {
  data: JSON.stringify(responseB),
})

describe("@molassesapp/molasses-server", () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })
  afterEach(() => {
    jest.clearAllTimers()
    mockAxios.reset()
  })
  it("should error with no api key", () => {
    try {
      new MolassesClient({
        APIKey: "",
        sendEvents: false,
      })
    } catch (error) {
      expect(error.message).toEqual("API KEY is required for Molasses to start")
    }
  })
  it("should be initable when it goes to molasses.app", (done) => {
    const response: {
      data: { features: Feature[] }
    } = {
      data: {
        features: [
          {
            active: true,
            description: "foo",
            key: "FOO_TEST",
            segments: [],
          },
          {
            active: false,
            description: "foo",
            key: "FOO_FALSE_TEST",
            segments: [],
          },
          {
            active: true,
            description: "foo",
            key: "FOO_50_PERCENT_TEST",
            segments: [
              {
                constraint: Operator.all,
                segmentType: SegmentType.everyoneElse,
                percentage: 50,
                userConstraints: [],
              },
            ],
          },
          {
            active: true,
            description: "foo",
            key: "FOO_0_PERCENT_TEST",
            segments: [
              {
                constraint: Operator.all,
                segmentType: SegmentType.everyoneElse,
                percentage: 0,
                userConstraints: [],
              },
            ],
          },
        ],
      },
    }

    const client = new MolassesClient({
      APIKey: "testapikey",
      sendEvents: false,
      streaming: false,
    })
    client
      .init()
      .then((result) => {
        expect(result).toBe(true)
        client.stop()

        expect(client.isActive("FOO_TEST")).toBeTruthy()
        expect(client.isActive("FOO_FALSE_TEST")).toBeFalsy()
        expect(client.isActive("FOO_50_PERCENT_TEST", { id: "123", params: {} })).toBeTruthy()
        expect(client.isActive("FOO_50_PERCENT_TEST", { id: "1234", params: {} })).toBeFalsy()
        expect(client.isActive("FOO_0_PERCENT_TEST", { id: "123", params: {} })).toBeFalsy()
        done()
      })
      .catch((reason) => {
        console.error(reason)
      })
    expect(mockAxios.get).toBeCalledWith("/features", {
      headers: { Authorization: "Bearer testapikey" },
    })
    mockAxios.mockResponse({ data: response })
  })

  it("calling  before init returns false on actions", () => {
    const client = new MolassesClient({
      APIKey: "testapikey",
      sendEvents: false,
      streaming: false,
    })
    expect(client.isActive("FOO_TEST")).toBeFalsy()
    expect(client.isActive("FOO_OFF_TEST")).toBeFalsy()
    expect(client.experimentSuccess("FOO_TEST", {}, user)).toBeFalsy()
  })

  it("should handle complex user segments", (done) => {
    const client = new MolassesClient({
      APIKey: "testapikey",
      sendEvents: false,
      streaming: false,
    })
    client
      .init()
      .then((result) => {
        expect(result).toBe(true)
        client.stop()

        expect(client.isActive("FOO_TEST")).toBeTruthy()

        expect(
          client.isActive("FOO_TEST", {
            id: "123",
            params: {
              isBetaUser: "true",
            },
          }),
        ).toBeTruthy()

        expect(
          client.isActive("FOO_TEST", {
            id: "123",
            params: {
              isScaredUser: "maybe",
            },
          }),
        ).toBeFalsy()

        expect(
          client.isActive("FOO_TEST", {
            id: "123",
            params: {
              isScaredUser: "false",
            },
          }),
        ).toBeTruthy()
        done()
      })
      .catch((reason) => {
        console.error(reason)
      })

    expect(mockAxios.get).toBeCalledWith("/features", {
      headers: { Authorization: "Bearer testapikey" },
    })
    mockAxios.mockResponse({ data: response })
  })

  it("should handle more complex user segments", (done) => {
    const client = new MolassesClient({
      APIKey: "testapikey",
      sendEvents: false,
      streaming: false,
    })
    client
      .init()
      .then((result) => {
        expect(result).toBe(true)
        client.stop()

        expect(client.isActive("FOO_TEST")).toBeTruthy()

        expect(
          client.isActive("FOO_TEST", {
            id: "123",
            params: {
              isBetaUser: "true",
            },
          }),
        ).toBeTruthy()

        expect(
          client.isActive("FOO_TEST", {
            id: "123",
            params: {
              isScaredUser: "maybe",
            },
          }),
        ).toBeTruthy()

        expect(
          client.isActive("FOO_TEST", {
            id: "123",
            params: {
              isScaredUser: "false",
            },
          }),
        ).toBeTruthy()
        expect(client.isActive("NON_EXISTENT", { id: "123", params: {} })).toBeFalsy()
        expect(client.isActive("NON_EXISTENT", { id: "123", params: {} }, true)).toBeTruthy()

        done()
      })
      .catch((reason) => {
        console.error(reason)
      })
    expect(mockAxios.get).toBeCalledWith("/features", {
      headers: { Authorization: "Bearer testapikey" },
    })
    mockAxios.mockResponse({ data: responseB })
  })

  it("should handle even more complex user segments", (done) => {
    const responseC: {
      data: { features: Feature[] }
    } = {
      data: {
        features: [
          {
            active: true,
            description: "foo",
            key: "FOO_TEST",
            segments: [
              {
                percentage: 100,
                segmentType: SegmentType.alwaysControl,
                constraint: Operator.all,
                userConstraints: [
                  {
                    userParam: "isScaredUser",
                    operator: Operator.contains,
                    values: "scared",
                  },
                  {
                    userParam: "isDefinitelyScaredUser",
                    operator: Operator.contains,
                    values: "scared",
                  },
                  {
                    userParam: "isMostDefinitelyScaredUser",
                    operator: Operator.contains,
                    values: "scared",
                  },
                ],
              },
              {
                percentage: 100,
                segmentType: SegmentType.alwaysExperiment,
                constraint: Operator.any,
                userConstraints: [
                  {
                    userParam: "isBetaUser",
                    operator: Operator.doesNotContain,
                    values: "fal",
                  },
                  {
                    userParam: "isDefinitelyBetaUser",
                    operator: Operator.doesNotContain,
                    values: "fal",
                  },
                ],
              },
              {
                constraint: Operator.all,
                percentage: 100,
                segmentType: SegmentType.everyoneElse,
                userConstraints: [],
              },
            ],
          },
        ],
      },
    }

    const client = new MolassesClient({
      APIKey: "testapikey",
      sendEvents: false,
      streaming: false,
    })
    client
      .init()
      .then((result) => {
        expect(result).toBe(true)
        client.stop()

        expect(client.isActive("FOO_TEST")).toBeTruthy()

        expect(
          client.isActive("FOO_TEST", {
            id: "123",
            params: {
              isBetaUser: "down truth",
            },
          }),
        ).toBeTruthy()

        expect(
          client.isActive("FOO_TEST", {
            id: "123",
            params: {
              isScaredUser: "i am very scared man",
            },
          }),
        ).toBeTruthy()
        expect(
          client.isActive("FOO_TEST", {
            id: "123",
            params: {
              isScaredUser: "i am very scared man",
              isDefinitelyScaredUser: "i am very scared man",
            },
          }),
        ).toBeTruthy()
        expect(
          client.isActive("FOO_TEST", {
            id: "123",
            params: {
              isScaredUser: "i am very scared man",
              isDefinitelyScaredUser: "i am very scared man",
              isMostDefinitelyScaredUser: "i am very scared man",
            },
          }),
        ).toBeFalsy()

        expect(
          client.isActive("FOO_TEST", {
            id: "123",
            params: {
              isScaredUser: "false",
            },
          }),
        ).toBeTruthy()
        done()
      })
      .catch((reason) => {
        console.error(reason)
      })
    expect(mockAxios.get).toBeCalledWith("/features", {
      headers: { Authorization: "Bearer testapikey" },
    })
    mockAxios.mockResponse({ data: responseC })
  })

  it("should handle refresh", (done) => {
    const client = new MolassesClient({
      APIKey: "testapikey",
      sendEvents: false,
      refreshInterval: 100,
      streaming: false,
    })
    client
      .init()
      .then(() => {
        expect(client.isActive("FOO_TEST")).toBeTruthy()
        jest.runAllTimers()

        expect(mockAxios.get).toBeCalledWith("/features", {
          headers: { Authorization: "Bearer testapikey", "If-None-Match": "yo" },
        })
        done()
      })
      .catch((reason) => {
        console.error(reason)
      })
    expect(mockAxios.get).toBeCalledWith("/features", {
      headers: { Authorization: "Bearer testapikey" },
    })
    mockAxios.mockResponse({ data: response, headers: { etag: "yo" } })
  })

  it("should handle failures", (done) => {
    const client = new MolassesClient({
      APIKey: "testapikey",
      sendEvents: false,
      refreshInterval: 100,
      streaming: false,
    })
    client.init().catch((reason) => {
      done()
    })
    expect(mockAxios.get).toBeCalledWith("/features", {
      headers: { Authorization: "Bearer testapikey" },
    })
    mockAxios.mockError(new Error("fail"))
  })

  it("should handle sending events", (done) => {
    const response: {
      data: { features: Feature[] }
    } = {
      data: {
        features: [
          {
            active: true,
            description: "foo",
            key: "FOO_TEST",
            segments: [
              {
                constraint: Operator.all,
                percentage: 100,
                segmentType: SegmentType.alwaysControl,
                userConstraints: [
                  {
                    userParam: "isScaredUser",
                    operator: Operator.in,
                    values: "true,maybe",
                  },
                ],
              },
              {
                constraint: Operator.all,
                percentage: 100,
                segmentType: SegmentType.alwaysExperiment,
                userConstraints: [
                  {
                    userParam: "isBetaUser",
                    operator: Operator.equals,
                    values: "true",
                  },
                ],
              },
              {
                constraint: Operator.all,
                percentage: 100,
                segmentType: SegmentType.everyoneElse,
                userConstraints: [],
              },
            ],
          },
        ],
      },
    }

    const client = new MolassesClient({
      APIKey: "testapikey",
      sendEvents: true,
      streaming: false,
    })
    client.init().then(() => {
      expect(client.isActive("FOO_TEST", user)).toBeTruthy()
      expect(
        client.isActive("FOO_TEST", { id: "123", params: { isScaredUser: "true" } }),
      ).toBeFalsy()
      // Fast-forward until all timers have been executed
      jest.advanceTimersByTime(200)
      expect(mockAxios.post).toBeCalledWith(
        "/analytics",
        {
          event: "experiment_started",
          featureId: undefined,
          featureName: "FOO_TEST",
          tags: '{"isScaredUser":"false"}',
          testType: "experiment",
          userId: "123",
        },
        { headers: { Authorization: "Bearer testapikey" } },
      )
      client.experimentSuccess(
        "FOO_TEST",
        {
          test: "123",
        },
        user,
      )

      client.experimentSuccess(
        "FOO_TEST",
        {
          test: "123",
        },
        { id: "123", params: { isScaredUser: "true" } },
      )
      client.experimentSuccess("NON_EXISTENT", null, {
        id: "123",
        params: { isScaredUser: "true" },
      })

      client.experimentSuccess("NON_EXISTENT", null, {
        id: "123",
        params: { isScaredUser: "true" },
      })
      done()
    })
    expect(mockAxios.get).toBeCalledWith("/features", {
      headers: { Authorization: "Bearer testapikey" },
    })

    mockAxios.mockResponse({ data: response })
  })

  it("should handle streaming", (done) => {
    const client = new MolassesClient({
      APIKey: "testapikey",
      sendEvents: false,
      streaming: true,
    })

    client
      .init()
      .then(() => {
        console.log("hi james")
        done()
      })
      .catch((err) => {
        console.error(err)
        done()
      })
    sources["https://sdk.molasses.app/v1/event-stream"].emitOpen()
    sources["https://sdk.molasses.app/v1/event-stream"].emitMessage(validMessage)
    const err = new Error("unauthorized") as any
    err.status = 401
    sources["https://sdk.molasses.app/v1/event-stream"].emitError(err)
    const othererror = new Error("i'm done dude") as any
    othererror.status = 503
    sources["https://sdk.molasses.app/v1/event-stream"].emitError(othererror)
  })
})
