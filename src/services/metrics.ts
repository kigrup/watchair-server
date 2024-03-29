import { nanoid } from 'nanoid'
import { inspect } from 'util'
import { Metric, MetricHeader, MetricHeaderAttributes, MetricValue, MetricValueAttributes } from '../types'
import { logger } from '../utils/logger'

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
      domainId: metricHeader.domainId,
      values: (metricHeader.metricValues != null)
        ? metricHeader.metricValues.map((metricValue: MetricValue): MetricValueAttributes => {
          return {
            id: metricValue.id,
            headerId: metricValue.headerId,
            value: metricValue.value,
            min: metricValue.min,
            max: metricValue.max,
            step: metricValue.step,
            unit: metricValue.unit,
            label: metricValue.label,
            color: metricValue.color
          }
        })
        : []
    }
    return metric
  })

  logger.log('info', `services::metrics::getDomainMetrics: Retrieved Metrics: ${inspect(metrics, { depth: 2 })}`)

  return metrics
}

export const createMetricHeader = async (metricHeaderAttributes: MetricHeaderAttributes): Promise<MetricHeader> => {
  const metricHeader: MetricHeader = await MetricHeader.create({
    ...metricHeaderAttributes,
    id: nanoid()
  })

  logger.log('info', `services::metrics::createMetricHeader: Created new MetricHeader: ${inspect(metricHeader, { depth: 1 })}`)

  return metricHeader
}

export const createMetricValue = async (metricValueAttributes: MetricValueAttributes): Promise<MetricValue> => {
  const metricValue: MetricValue = await MetricValue.create({
    ...metricValueAttributes,
    max: metricValueAttributes.max,
    id: nanoid()
  })

  logger.log('info', `services::metrics::createMetricValue: Created new MetricValue: ${inspect(metricValue, { depth: 1 })}`)

  return metricValue
}

export const createMetricValues = async (metricValueAttributes: MetricValueAttributes[]): Promise<MetricValue[]> => {
  const metricValues: MetricValue[] = []
  for (let i = 0; i < metricValueAttributes.length; i++) {
    const metricValue: MetricValue = await createMetricValue(metricValueAttributes[i])
    metricValues.push(metricValue)
  }

  logger.log('info', `services::metrics::createMetricValues: Created new MetricValues: ${inspect(metricValues, { depth: 1 })}`)

  return metricValues
}
