import { nanoid } from 'nanoid'
import { inspect } from 'util'
import { Metric, MetricHeader, MetricHeaderAttributes, MetricValue, MetricValueAttributes } from '../types'

export const getDomainMetrics = async (domainId: string): Promise<Metric[]> => {
  const metricHeaders = await MetricHeader.findAll({
    where: {
      domainId: domainId
    },
    include: [{
      model: MetricValue,
      as: 'metricValues'
    }]
  })

  const metrics: Metric[] = metricHeaders.map((metricHeader: MetricHeader) => {
    const metric: Metric = {
      id: metricHeader.id,
      title: metricHeader.title,
      description: metricHeader.description,
      valueMin: metricHeader.valueMin,
      valueMax: metricHeader.valueMax,
      valueStep: metricHeader.valueStep,
      valueUnit: metricHeader.valueUnit,
      domainId: metricHeader.domainId,
      values: (metricHeader.metricValues != null)
        ? metricHeader.metricValues.map((metricValue: MetricValue): MetricValueAttributes => {
          return {
            id: metricValue.id,
            headerId: metricValue.headerId,
            value: metricValue.value,
            label: metricValue.label,
            color: metricValue.color
          }
        })
        : []
    }
    return metric
  })

  console.log(`services::metrics::getDomainMetrics: Retrieved Metrics: ${inspect(metrics, { depth: 2 })}`)

  return metrics
}

export const createMetricHeader = async (metricHeaderAttributes: MetricHeaderAttributes): Promise<MetricHeader> => {
  const metricHeader: MetricHeader = await MetricHeader.create({
    ...metricHeaderAttributes,
    id: nanoid()
  })

  console.log(`services::metrics::createUnitMetric: Created new UnitMetric: ${inspect(metricHeader, { depth: 1 })}`)

  return metricHeader
}

export const createMetricValue = async (metricValueAttributes: MetricValueAttributes): Promise<MetricValue> => {
  const metricValue: MetricValue = await MetricValue.create({
    ...metricValueAttributes,
    id: nanoid()
  })

  console.log(`services::metrics::createUnitMetric: Created new UnitMetric: ${inspect(metricValue, { depth: 1 })}`)

  return metricValue
}
