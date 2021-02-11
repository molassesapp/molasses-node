/**
 * @jest-environment jsdom
 */
import { MolassesClient } from "../src"
import mockAxios from "jest-mock-axios"
import { Feature, SegmentType, Operator, UserParamType } from "@molassesapp/common"

const user = {
  id: "123",
  params: {
    isScaredUser: "false",
  },
}

describe("@molassesapp/molasses-js", () => {
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
      })
    } catch (error) {
      expect(error.message).toEqual("API KEY is required for Molasses to start")
    }
  })
  it("should be initable when it goes to molasses.app", (done) => {
    const response: {
      data: {
        features: Feature[]
      }
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
    })
    client
      .init()
      .then((result) => {
        expect(result).toBe(true)

        expect(client.isActive("FOO_TEST")).toBeTruthy()
        expect(client.isActive("FOO_FALSE_TEST")).toBeFalsy()
        expect(client.isActive("FOO_50_PERCENT_TEST", { id: "123", params: {} })).toBeTruthy()
        expect(client.isActive("FOO_50_PERCENT_TEST", { id: "1234", params: {} })).toBeFalsy()
        expect(client.isActive("FOO_0_PERCENT_TEST", { id: "123", params: {} })).toBeFalsy()
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
    mockAxios.mockResponse({ data: response })
  })

  it("should handle complex user segments", (done) => {
    const response: {
      data: {
        features: Feature[]
      }
    } = {
      data: {
        features: [
          {
            active: true,
            description: "fooo",
            key: "Numbers and Bools",
            segments: [
              {
                percentage: 100,
                segmentType: SegmentType.alwaysControl,
                constraint: Operator.all,
                userConstraints: [
                  {
                    userParam: "lt12",
                    userParamType: UserParamType.number,
                    operator: Operator.lessThan,
                    values: "12",
                  },
                  {
                    userParam: "eqTrue",
                    userParamType: "boolean",
                    operator: Operator.equals,
                    values: "true",
                  },
                  {
                    userParam: "doesNotEqualFalse",
                    userParamType: "boolean",
                    operator: Operator.doesNotEqual,
                    values: "false",
                  },
                  {
                    userParam: "lte12",
                    userParamType: UserParamType.number,
                    operator: Operator.lessThanOrEqualTo,
                    values: "12",
                  },
                  {
                    userParam: "gt12",
                    userParamType: UserParamType.number,
                    operator: Operator.greaterThan,
                    values: "12",
                  },
                  {
                    userParam: "gte12",
                    userParamType: UserParamType.number,
                    operator: Operator.greaterThanOrEqualTo,
                    values: "12",
                  },
                ],
              },
              {
                percentage: 100,
                segmentType: SegmentType.alwaysExperiment,
                constraint: Operator.all,
                userConstraints: [
                  {
                    userParam: "eq12",
                    userParamType: UserParamType.number,
                    operator: Operator.equals,
                    values: "12",
                  },
                  {
                    userParam: "dneq12",
                    userParamType: UserParamType.number,
                    operator: Operator.doesNotEqual,
                    values: "12",
                  },
                ],
              },
              {
                percentage: 0,
                segmentType: SegmentType.everyoneElse,
                constraint: Operator.all,
                userConstraints: [],
              },
            ],
          },
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
                    operator: Operator.in,
                    values: "true,maybe",
                  },
                ],
              },
              {
                percentage: 100,
                segmentType: SegmentType.alwaysExperiment,
                constraint: Operator.all,
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
    })
    client
      .init()
      .then((result) => {
        expect(result).toBe(true)
        client.identify({
          id: "123",
          params: {
            isScaredUser: "true",
          },
        })

        expect(client.isActive("FOO_TEST")).toBeFalsy()
        client.resetUser()
        expect(client.isActive("FOO_TEST")).toBeTruthy()
        client.identify({
          id: "123",
          params: {
            isScaredUser: "false",
          },
        })
        expect(client.isActive("FOO_TEST")).toBeTruthy()

        expect(
          client.isActive("Numbers and Bools", {
            id: "1234",
            params: {
              lt12: 11,
              eqTrue: true,
              doesNotEqualFalse: true,
              lte12: 11,
              gt12: 13,
              gte12: 12,
              eq12: 13,
              dneq12: 12,
            },
          }),
        ).toBeFalsy()
        expect(
          client.isActive("Numbers and Bools", {
            id: "1234",
            params: {
              eq12: 13,
              dneq12: 12,
            },
          }),
        ).toBeFalsy()
        expect(
          client.isActive("Numbers and Bools", {
            id: "1234",
            params: {
              lt12: 11,
              eqTrue: true,
              doesNotEqualFalse: false,
              lte12: 11,
              gt12: 13,
              gte12: 12,
              eq12: 12,
              dneq12: 11,
            },
          }),
        ).toBeTruthy()
        expect(
          client.isActive("Numbers and Bools", {
            id: "1234",
            params: {
              lt12: 12,
              eqTrue: false,
              doesNotEqualFalse: false,
              lte12: 13,
              gt12: 11,
              gte12: 11,
              eq12: 12,
              dneq12: 11,
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

  it("calling  before init returns false on actions", () => {
    const client = new MolassesClient({
      APIKey: "testapikey",
    })
    expect(client.isActive("FOO_TEST")).toBeFalsy()
    expect(client.isActive("FOO_OFF_TEST")).toBeFalsy()
    expect(client.experimentSuccess("FOO_TEST", {}, user)).toBeFalsy()
  })

  it("should handle failures", (done) => {
    const client = new MolassesClient({
      APIKey: "testapikey",
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
      autoSendEvents: true,
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
      client.experimentStarted(
        "FOO_TEST",
        {
          test: "123",
        },
        user,
      )
      client.track(
        "I am a track event",
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
        user,
      )

      client.experimentSuccess(
        "FOO_TEST",
        {
          test: "123",
        },
        { id: "123", params: { isScaredUser: "true" } },
      )

      client.experimentSuccess("NON_EXISTENT", null)

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
})
