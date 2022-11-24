// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as pulumi from '@pulumi/pulumi'
import * as gcp from '@pulumi/gcp'

import * as ccloud from '@pulumi/confluentcloud'

import { getTopicName } from './src/topicName'

const ccloudEnv = new ccloud.Environment(
  'sam-cam',
  {
    displayName: 'SamCam',
  },
  { protect: true },
)

const kafkaClusterArgs: ccloud.KafkaClusterArgs = {
  environment: { id: ccloudEnv.id },
  availability: 'SINGLE_ZONE',
  cloud: 'GCP',
  region: 'us-east4',
  displayName: 'Sam Cam',
  basics: [{}],
}

const kafkaCluster = new ccloud.KafkaCluster('sam-cam', kafkaClusterArgs)

const ccloudServiceAccount = new ccloud.ServiceAccount('samcam-manager', {
  displayName: 'SamCamManager',
  description: 'Pulumi service account to manage SamCam cluster',
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ccloudClusterAdmin = new ccloud.RoleBinding(
  'samcam-manager-cluster-admin',
  {
    crnPattern: kafkaCluster.rbacCrn,
    principal: pulumi.interpolate`User:${ccloudServiceAccount.id}`,
    roleName: 'CloudClusterAdmin',
  },
  { dependsOn: [ccloudServiceAccount] },
)

const kafkaApiKey = new ccloud.ApiKey(
  'pulumi-samcam-apikey',
  {
    owner: {
      apiVersion: ccloudServiceAccount.apiVersion,
      id: ccloudServiceAccount.id,
      kind: ccloudServiceAccount.kind,
    },
    managedResource: {
      environment: { id: ccloudEnv.id },
      id: kafkaCluster.id,
      apiVersion: kafkaCluster.apiVersion,
      kind: kafkaCluster.kind,
    },
    description: 'For Pulumi to create Topics',
    displayName: 'PulumiSamCamApiKey',
  },
  {
    dependsOn: [ccloudServiceAccount, ccloudClusterAdmin],
  },
)

const audioRecordingQueueTopicName = getTopicName(
  'queuing',
  'recordings',
  'audio',
)
const audioRecordingQueueTopic = new ccloud.KafkaTopic(
  `topic-${audioRecordingQueueTopicName}`,
  {
    kafkaCluster: { id: kafkaCluster.id },
    topicName: audioRecordingQueueTopicName,
    restEndpoint: kafkaCluster.restEndpoint,
    credentials: {
      key: kafkaApiKey.id,
      secret: kafkaApiKey.secret,
    },
    partitionsCount: 2,
  },
)

// Create a GCP resource (Storage Bucket)
const bucket = new gcp.storage.Bucket('audio', { location: 'US' })

// Export the DNS name of the bucket
export const bucketUrl = bucket.url

// Export the usable topic reference
export const audioRecordingQueueTopicUrl = audioRecordingQueueTopic.restEndpoint
