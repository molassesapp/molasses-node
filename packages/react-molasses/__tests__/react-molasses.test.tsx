/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom"
import { MolassesProvider, Feature as Feat, withMolasses } from "../src/"
import { render, screen, cleanup } from "@testing-library/react"
import mockAxios from "jest-mock-axios"
import { Feature, Operator, SegmentType } from "@molassesapp/common"
import { MolassesClient } from "../../molasses-js/src"
import * as React from "react"
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
        segments: [
          {
            constraint: Operator.all,
            segmentType: SegmentType.everyoneElse,
            percentage: 100,
            userConstraints: [],
          },
        ],
      },
      {
        active: false,
        description: "foo",
        key: "FOO_FALSE_TEST",
        segments: [
          {
            constraint: Operator.all,
            segmentType: SegmentType.everyoneElse,
            percentage: 100,
            userConstraints: [],
          },
        ],
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
describe("react-molasses", () => {
  beforeEach(() => {
    cleanup()
  })
  it("MolassesProvider and Feature", (done) => {
    const client = new MolassesClient({
      APIKey: "testapikey",
      sendEvents: false,
    })
    client
      .init()
      .then((result) => {
        render(
          <MolassesProvider client={client}>
            <h1>HI There</h1>
            <Feat
              name="FOO_TEST"
              user={{ id: "123", params: {} }}
              render={(isActive: boolean) => {
                return isActive ? <span>active</span> : <span>off</span>
              }}
            />
          </MolassesProvider>,
        )
        expect(screen.queryByText(/active/i)).toBeInTheDocument()
        expect(screen.queryByText(/off/i)).not.toBeInTheDocument()
        done()
      })
      .catch((err) => {
        console.error(err)
      })
    mockAxios.mockResponse({ data: response })
    expect(mockAxios.get).toBeCalledWith("/get-features", {
      headers: { Authorization: "Bearer testapikey" },
    })
  })
  it("MolassesProvider and Feature - as children", (done) => {
    const client = new MolassesClient({
      APIKey: "testapikey",
      sendEvents: false,
    })
    client
      .init()
      .then((result) => {
        render(
          <MolassesProvider client={client}>
            <h1>HI There</h1>
            <Feat name="FOO_50_PERCENT_TEST" user={{ id: "123", params: {} }}>
              {(isActive: boolean) => {
                return isActive ? <span>50% active</span> : <span>off</span>
              }}
            </Feat>
          </MolassesProvider>,
          {},
        )
        expect(screen.queryByText(/active/i)).not.toBeInTheDocument()
        expect(screen.queryByText(/off/i)).toBeInTheDocument()

        done()
      })
      .catch((err) => {
        console.error(err)
      })
    mockAxios.mockResponse({ data: response })
    expect(mockAxios.get).toBeCalledWith("/get-features", {
      headers: { Authorization: "Bearer testapikey" },
    })
  })

  it("MolassesProvider and Feature - as children only", (done) => {
    const client = new MolassesClient({
      APIKey: "testapikey",
      sendEvents: false,
    })
    client
      .init()
      .then((result) => {
        render(
          <MolassesProvider client={client}>
            <h1>HI There</h1>
            <Feat name="FOO_50_PERCENT_TEST" user={{ id: "124", params: {} }}>
              <span>active</span>
            </Feat>
            <Feat name="FOO_FALSE_TEST" user={{ id: "124", params: {} }}>
              <span>fooo</span>
            </Feat>
          </MolassesProvider>,
          {},
        )
        expect(screen.queryByText(/active/i)).toBeInTheDocument()
        expect(screen.queryByText(/fooo/i)).not.toBeInTheDocument()

        done()
      })
      .catch((err) => {
        console.error(err)
      })
    mockAxios.mockResponse({ data: response })
    expect(mockAxios.get).toBeCalledWith("/get-features", {
      headers: { Authorization: "Bearer testapikey" },
    })
  })

  it("withMolasses", (done) => {
    const client = new MolassesClient({
      APIKey: "testapikey",
      sendEvents: false,
    })

    const comp = (props: any) => {
      const isActive = props.molasses.isActive("FOO_TEST")
      return isActive ? <h1>active</h1> : <h1>off</h1>
    }
    const Component = withMolasses(comp)

    client
      .init()
      .then((result) => {
        render(
          <MolassesProvider client={client}>
            <h1>HI There</h1>
            <Component />
          </MolassesProvider>,
        )
        expect(screen.queryByText(/active/i)).toBeInTheDocument()
        expect(screen.queryByText(/off/i)).not.toBeInTheDocument()
        done()
      })
      .catch((err) => {
        console.error(err)
      })
    mockAxios.mockResponse({ data: response })
    expect(mockAxios.get).toBeCalledWith("/get-features", {
      headers: { Authorization: "Bearer testapikey" },
    })
  })
})
