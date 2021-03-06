const { crc32 } = require("crc")
const compare = require("semver/functions/compare-loose")
export interface Feature {
  id?: string
  key: string
  description: string
  // variants: Variant[];
  active: boolean
  segments: FeatureSegment[]
}

export interface FeatureSegment {
  percentage: number
  userConstraints: UserConstraint[]
  segmentType: SegmentType
  constraint: Operator
}
export interface UserConstraint {
  featureSegmentID?: string
  operator: Operator
  values: string
  userParam: string
  userParamType?: string
}

export enum SegmentType {
  alwaysControl = "alwaysControl",
  alwaysExperiment = "alwaysExperiment",
  everyoneElse = "everyoneElse",
}

export enum UserParamType {
  number = "number",
  boolean = "boolean",
  string = "string",
  semver = "semver",
}

export enum Operator {
  any = "any",
  all = "all",
  in = "in",
  nin = "nin",
  equals = "equals",
  doesNotEqual = "doesNotEqual",
  contains = "contains",
  doesNotContain = "doesNotContain",
  greaterThan = "gt",
  lessThan = "lt",
  greaterThanOrEqualTo = "gte",
  lessThanOrEqualTo = "lte",
}

export type InputType = string | number | boolean
export interface User {
  id: string
  params: {
    [key: string]: InputType
  }
}

export const getUserPercentage = (id: string, percentage: number) => {
  if (percentage === 100) {
    return true
  }
  if (percentage === 0) {
    return false
  }
  const c = crc32(id)
  const v = Math.abs(c % 100.0)
  return v < percentage
}

export const isActive = (feature: Feature, user?: User): boolean => {
  if (!feature.active) {
    return false
  }

  if (!user || !user.id) {
    return true
  }
  const segmentMap = feature.segments.reduce<{ [key: string]: FeatureSegment }>(
    (acc, featureSegment) => {
      switch (featureSegment.segmentType) {
        case SegmentType.alwaysControl:
          acc[SegmentType.alwaysControl] = featureSegment
          break
        case SegmentType.alwaysExperiment:
          acc[SegmentType.alwaysExperiment] = featureSegment
          break
        case SegmentType.everyoneElse:
          acc[SegmentType.everyoneElse] = featureSegment
          break
        default:
          break
      }
      return acc
    },
    {},
  )
  if (
    segmentMap[SegmentType.alwaysControl] &&
    isUserInSegment(user, segmentMap[SegmentType.alwaysControl])
  ) {
    return false
  }

  if (
    segmentMap[SegmentType.alwaysExperiment] &&
    isUserInSegment(user, segmentMap[SegmentType.alwaysExperiment])
  ) {
    return true
  }
  return getUserPercentage(user.id, segmentMap[SegmentType.everyoneElse].percentage)
}

const containsParamValue = (listAsString: string, a: string) => {
  const list = listAsString.split(",")
  return list.includes(a)
}

const isUserInSegment = (user: User, s: FeatureSegment) => {
  const constraintsToBeMet = s.constraint == Operator.any ? 1 : s.userConstraints.length
  let constraintsMet = 0

  for (let index = 0; index < s.userConstraints.length; index++) {
    const constraint = s.userConstraints[index]

    let paramExists = Boolean(user.params[constraint.userParam])
    let userValue = user.params[constraint.userParam]

    if (constraint.userParam == "id") {
      paramExists = true
      userValue = user.id
    }

    switch (constraint.userParamType) {
      case UserParamType.number:
        const valueNumber = parseNumber(userValue)
        if (meetsConstraintForNumber(valueNumber as number, paramExists, constraint)) {
          constraintsMet = constraintsMet + 1
        }
        break
      case UserParamType.boolean:
        const valueBoolean = parseBoolean(userValue)
        if (meetsConstraintForBool(valueBoolean as boolean, paramExists, constraint)) {
          constraintsMet = constraintsMet + 1
        }
        break
      case UserParamType.semver:
        const valueSemver = parseString(userValue)
        if (meetsConstraintForSemVer(valueSemver as string, paramExists, constraint)) {
          constraintsMet = constraintsMet + 1
        }
        break
      default:
        const value = parseString(userValue)
        if (meetsConstraint(value as string, paramExists, constraint)) {
          constraintsMet = constraintsMet + 1
        }
        break
    }
  }

  return constraintsMet >= constraintsToBeMet
}

const parseNumber = (value: string | boolean | number): number => {
  switch (typeof value) {
    case "boolean":
      return 0
    case "number":
      return value
    default:
      return parseFloat(value)
  }
}

const parseString = (value: string | boolean | number): string => {
  switch (typeof value) {
    case "boolean":
    case "number":
      return value.toString()
    default:
      return value
  }
}

const parseBoolean = (value: string | boolean | number): boolean => {
  switch (typeof value) {
    case "string":
      return value === "true"
    case "number":
      return !!value
    default:
      return value
  }
}

const meetsConstraintForBool = (
  userValue: boolean,
  paramExists: boolean,
  constraint: UserConstraint,
) => {
  const value = constraint.values === "true"
  switch (constraint.operator) {
    case Operator.equals:
      if (paramExists && userValue === value) {
        return true
      }
      break
    case Operator.doesNotEqual:
      if (paramExists && userValue !== value) {
        return true
      }
      break
    default:
      return false
  }
  return false
}
const meetsConstraintForSemVer = (
  userValue: string,
  paramExists: boolean,
  constraint: UserConstraint,
) => {
  const value = userValue
  if (!paramExists) {
    return false
  }
  switch (constraint.operator) {
    case Operator.equals:
      if (compare(value, constraint.values) === 0) {
        return true
      }
      break
    case Operator.doesNotEqual:
      if (compare(value, constraint.values) !== 0) {
        return true
      }
      break
    case Operator.lessThan:
      if (compare(value, constraint.values) < 0) {
        return true
      }
      break
    case Operator.lessThanOrEqualTo:
      if (compare(value, constraint.values) <= 0) {
        return true
      }
      break
    case Operator.greaterThan:
      if (compare(value, constraint.values) > 0) {
        return true
      }
      break
    case Operator.greaterThanOrEqualTo:
      if (compare(value, constraint.values) >= 0) {
        return true
      }
      break
    default:
      return false
  }
  return false
}

const meetsConstraint = (userValue: string, paramExists: boolean, constraint: UserConstraint) => {
  switch (constraint.operator) {
    case Operator.in:
      if (paramExists && containsParamValue(constraint.values, userValue)) {
        return true
      }
      break
    case Operator.nin:
      if (paramExists && !containsParamValue(constraint.values, userValue)) {
        return true
      }
      break
    case Operator.equals:
      if (paramExists && userValue === constraint.values) {
        return true
      }
      break
    case Operator.doesNotEqual:
      if (paramExists && userValue !== constraint.values) {
        return true
      }
      break
    case Operator.contains:
      if (paramExists && userValue.includes(constraint.values)) {
        return true
      }
      break
    case Operator.doesNotContain:
      if (paramExists && !userValue.includes(constraint.values)) {
        return true
      }
      break
    default:
      return false
  }
  return false
}

const meetsConstraintForNumber = (
  userValue: number,
  paramExists: boolean,
  constraint: UserConstraint,
) => {
  const value = parseFloat(constraint.values)
  switch (constraint.operator) {
    case Operator.equals:
      if (paramExists && userValue === value) {
        return true
      }
      break
    case Operator.doesNotEqual:
      if (paramExists && userValue !== value) {
        return true
      }
      break
    case Operator.lessThan:
      if (paramExists && userValue < value) {
        return true
      }
      break
    case Operator.lessThanOrEqualTo:
      if (paramExists && userValue <= value) {
        return true
      }
      break
    case Operator.greaterThan:
      if (paramExists && userValue > value) {
        return true
      }
      break
    case Operator.greaterThanOrEqualTo:
      if (paramExists && userValue >= value) {
        return true
      }
      break
    default:
      return false
  }
  return false
}
