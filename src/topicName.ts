// Imagine this file being published as an org-wide lib that must be used for
// topic creation.

/**
 *  `logging` - For logging data (slf4j, syslog, etc)
 *
 *  `queuing` - For classical queuing use cases.
 *
 *  `tracking` - For tracking events such as user clicks, page views, ad views, etc.
 *
 *  `etl` - For ETL and CDC use cases such as database feeds.
 *
 *  `streaming` - For intermediate topics created by stream processing pipelines.
 *
 *  `push` - For data that’s being pushed from offline (batch computation) environments into online environments.
 *
 *  `user` - For user-specific data such as scratch and test topics.
 */
export type TopicMessageType =
  | 'logging'
  | 'queuing'
  | 'tracking'
  | 'etl'
  | 'streaming'
  | 'push'
  | 'user'

/**
 * The dataset name is analogous to a database name in traditional RDBMS systems. It’s used as a category to group topics together.
 */
export type TopicDatasetName = string

/**
 * The data name field is analogous to a table name in traditional RDBMS systems, though it’s fine to include further dotted notation if developers wish to impose their own hierarchy within the dataset namespace.
 */
export type TopicDataName = string

export const getTopicName = (
  messageType: TopicMessageType,
  datasetName: TopicDatasetName,
  dataName: TopicDataName,
) => `${messageType}.${datasetName}.${dataName}`
