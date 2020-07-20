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

export const isActive = (feature: Feature, user?: User): boolean => {
  if (!feature.active) {
    return false
  }

  if (!user) {
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

  if (segmentMap[SegmentType.alwaysControl]) {
    return false
  }
  if (segmentMap[SegmentType.alwaysExperiment]) {
    return false
  }

  return true
}
