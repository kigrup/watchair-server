import { nanoid } from 'nanoid'
import { inspect } from 'util'
import { UnitMetric } from '../types'

export const getUnitMetrics = async (): Promise<UnitMetric[]> => {
  const unitMetrics: UnitMetric[] = await UnitMetric.findAll()

  console.log(`services::metrics::getUnitMetrics: Retrieved UnitMetrics: ${inspect(unitMetrics, { depth: 1 })}`)

  return unitMetrics
}

export const getUnitMetric = async (unitMetricId: string): Promise<UnitMetric | null> => {
  const unitMetric = await UnitMetric.findOne({
    where: {
      id: unitMetricId
    }
  })

  console.log(`services::metrics::getUnitMetric: Retrieved UnitMetric: ${inspect(unitMetric, { depth: 1 })}`)

  return unitMetric
}

export const getDomainUnitMetrics = async (domainId: string): Promise<UnitMetric[]> => {
  const unitMetrics = await UnitMetric.findAll({
    where: {
      domainId: domainId
    }
  })

  console.log(`services::metrics::getDomainUnitMetrics: Retrieved UnitMetrics: ${inspect(unitMetrics, { depth: 1 })}`)

  return unitMetrics
}

export const createUnitMetric = async (title: string, description: string, value: number, minValue: number, maxValue: number, step: number, domainId: string): Promise<UnitMetric> => {
  const newUnitMetric: UnitMetric = await UnitMetric.create({
    id: nanoid(),
    title: title,
    description: description,
    value: value,
    minValue: minValue,
    maxValue: maxValue,
    step: step,
    domainId: domainId
  })

  console.log(`services::metrics::createUnitMetric: Created new UnitMetric: ${inspect(newUnitMetric, { depth: 1 })}`)

  return newUnitMetric
}
