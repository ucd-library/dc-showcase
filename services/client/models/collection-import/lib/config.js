const {config} = require('@ucd-lib/fin-service-utils');
const env = process.env;

config.k8s.templatesRoot = env.K8S_TEMPLATES || '/etc/fin/k8s-templates';
config.k8s.collectionImport = {
  templateName : env.K8S_COLLECTION_IMPORT_TEMPLATE_NAME || 'collection-import',
  image : env.K8S_COLLECTION_IMPORT_IMAGE,
  url : env.K8S_COLLECTION_IMPORT_URL,
  localDevHostPath : env.K8S_COLLECTION_IMPORT_LOCAL_DEV_HOST_PATH || '/mnt/',
  intendedForLabel : env.K8S_IMPORT_JOB_INTENDED_FOR,
  storageClass : env.K8S_IMPORT_STORAGE_CLASS
}

module.exports = config;