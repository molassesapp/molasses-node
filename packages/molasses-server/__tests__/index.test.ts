import MolassesClient from "../src"
import mockAxios from "jest-mock-axios"
import { Feature, SegmentType, Operator } from "@molassesapp/common"

describe("@molassesapp/molasses-server", () => {
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
      data: Feature[]
    } = {
      data: [
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
              segmentType: SegmentType.everyoneElse,
              percentage: 0,
              userConstraints: [],
            },
          ],
        },
      ],
    }

    const client = new MolassesClient({
      APIKey: "testapikey",
    })
    client
      .init()
      .then((result) => {
        expect(result).toBe(true)
        client.stop()

        expect(client.isActive("FOO_TEST")).toBeTruthy()
        expect(client.isActive("FOO_FALSE_TEST")).toBeFalsy()
        expect(client.isActive("FOO_50_PERCENT_TEST", { id: "123", params: {} })).toBeFalsy()
        expect(client.isActive("FOO_0_PERCENT_TEST", { id: "123", params: {} })).toBeFalsy()
        done()
      })
      .catch((reason) => {
        console.error(reason)
      })
    expect(mockAxios.get).toBeCalledWith("/v1/sdk/features", {
      headers: { Authorization: "Bearer testapikey" },
    })
    mockAxios.mockResponse({ data: response })
  })

  it("calling isActive before init returns false", () => {
    const client = new MolassesClient({
      APIKey: "testapikey",
    })
    expect(client.isActive("FOO_TEST")).toBeFalsy()
    expect(client.isActive("FOO_OFF_TEST")).toBeFalsy()
  })

  it("should handle complex user segments", (done) => {
    const response: {
      data: Feature[]
    } = {
      data: [
        {
          active: true,
          description: "foo",
          key: "FOO_TEST",
          segments: [
            {
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
              percentage: 100,
              segmentType: SegmentType.everyoneElse,
              userConstraints: [],
            },
          ],
        },
      ],
    }

    const client = new MolassesClient({
      APIKey: "testapikey",
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
    expect(mockAxios.get).toBeCalledWith("/v1/sdk/features", {
      headers: { Authorization: "Bearer testapikey" },
    })
    mockAxios.mockResponse({ data: response })
  })

  it("should handle more complex user segments", (done) => {
    const response: {
      data: Feature[]
    } = {
      data: [
        {
          active: true,
          description: "foo",
          key: "FOO_TEST",
          segments: [
            {
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
              percentage: 100,
              segmentType: SegmentType.everyoneElse,
              userConstraints: [],
            },
          ],
        },
      ],
    }

    const client = new MolassesClient({
      APIKey: "testapikey",
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
        done()
      })
      .catch((reason) => {
        console.error(reason)
      })
    expect(mockAxios.get).toBeCalledWith("/v1/sdk/features", {
      headers: { Authorization: "Bearer testapikey" },
    })
    mockAxios.mockResponse({ data: response })
  })

  it("should handle even more complex user segments", (done) => {
    const response: {
      data: Feature[]
    } = {
      data: [
        {
          active: true,
          description: "foo",
          key: "FOO_TEST",
          segments: [
            {
              percentage: 100,
              segmentType: SegmentType.alwaysControl,
              userConstraints: [
                {
                  userParam: "isScaredUser",
                  operator: Operator.contains,
                  values: "scared",
                },
              ],
            },
            {
              percentage: 100,
              segmentType: SegmentType.alwaysExperiment,
              userConstraints: [
                {
                  userParam: "isBetaUser",
                  operator: Operator.doesNotContain,
                  values: "fal",
                },
              ],
            },
            {
              percentage: 100,
              segmentType: SegmentType.everyoneElse,
              userConstraints: [],
            },
          ],
        },
      ],
    }

    const client = new MolassesClient({
      APIKey: "testapikey",
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
    expect(mockAxios.get).toBeCalledWith("/v1/sdk/features", {
      headers: { Authorization: "Bearer testapikey" },
    })
    mockAxios.mockResponse({ data: response })
  })
})
