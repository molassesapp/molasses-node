import { str } from "crc-32"
export interface Feature {
  key: string
  description: string
  // variants: Variant[];
  active: boolean
  segments: FeatureSegment[]
  // tags: Tag[];
}

export interface FeatureSegment {
  percentage: number
  userConstraints: UserConstraint[]
  segmentType: SegmentType
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

export enum Operator {
  all = "all",
  in = "in",
  nin = "nin",
  equals = "equals",
  doesNotEqual = "doesNotEqual",
  contains = "contains",
  doesNotContain = "doesNotContain",
  greaterThan = "greaterThan",
  lessThan = "lessThan",
  greaterThanOrEqualTo = "greaterThanOrEqualTo",
  lessThanOrEqualTo = "lessThanOrEqualTo",
}
export interface User {
  id: string
  params: {
    [key: string]: string
  }
}

export const getUserPercentage = (id: string, percentage: number) => {
  if (percentage === 100) {
    return true
  }
  if (percentage === 0) {
    return false
  }
  const c = str(id)
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
  for (let index = 0; index < s.userConstraints.length; index++) {
    const constraint = s.userConstraints[index]

    let paramExists = Boolean(user.params[constraint.userParam])
    let userValue = user.params[constraint.userParam]
    if (constraint.userParam == "id") {
      paramExists = true
      userValue = user.id
    }

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
  }
  return false
}
