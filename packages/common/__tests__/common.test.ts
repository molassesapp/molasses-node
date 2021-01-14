/**
 * @jest-environment jsdom
 */
import { getUserPercentage } from "../src/common"

describe("@molassesapp/common", () => {
  describe("getUserPercentage", () => {
    it("% is 100", () => {
      expect(getUserPercentage("1234", 100)).toBeTruthy()
      expect(getUserPercentage("1235", 100)).toBeTruthy()
      expect(getUserPercentage("1236", 100)).toBeTruthy()
      expect(getUserPercentage("1237", 100)).toBeTruthy()
      expect(getUserPercentage("1238", 100)).toBeTruthy()
      expect(getUserPercentage("1239", 100)).toBeTruthy()
      expect(getUserPercentage("1240", 100)).toBeTruthy()
    })
    it("% is 0", () => {
      expect(getUserPercentage("1234", 0)).toBeFalsy()
      expect(getUserPercentage("1235", 0)).toBeFalsy()
      expect(getUserPercentage("1236", 0)).toBeFalsy()
      expect(getUserPercentage("1237", 0)).toBeFalsy()
      expect(getUserPercentage("1238", 0)).toBeFalsy()
      expect(getUserPercentage("1239", 0)).toBeFalsy()
      expect(getUserPercentage("1240", 0)).toBeFalsy()
    })
    it("% is 50", () => {
      expect(getUserPercentage("123", 30)).toBeTruthy()
      expect(getUserPercentage("124", 30)).toBeTruthy()
      expect(getUserPercentage("125", 30)).toBeTruthy()
      expect(getUserPercentage("1232", 30)).toBeFalsy()
      expect(getUserPercentage("1233", 30)).toBeFalsy()
      expect(getUserPercentage("1234", 30)).toBeFalsy()
      expect(getUserPercentage("1235", 30)).toBeFalsy()
      expect(getUserPercentage("1236", 30)).toBeFalsy()
      expect(getUserPercentage("1237", 30)).toBeFalsy()
      expect(getUserPercentage("1238", 30)).toBeFalsy()
      expect(getUserPercentage("1239", 30)).toBeFalsy()
      expect(getUserPercentage("1240", 30)).toBeTruthy()
    })
  })
})
