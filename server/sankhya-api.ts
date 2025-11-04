
import axios from 'axios';
import { decrypt } from './crypto';

const axiosInstance = axios.create({
  timeout: 20000,
  maxContentLength: 50 * 1024 * 1024,
  maxBodyLength: 50 * 1024 * 1024
});

interface SankhyaCredentials {
  endpoint: string;
  appKey: string;
  username: string;
  password: string;
}

let tokenCache: { [key: string]: { token: string; expiresAt: number } } = {};

export async function obterToken(credentials: SankhyaCredentials, empresaId: string): Promise<string> {
  const cacheKey = empresaId;
  const cached = tokenCache[cacheKey];
  
  if (cached && cached.expiresAt > Date.now()) {
    console.log(`✅ Using cached token for empresa ${empresaId}`);
    return cached.token;
  }

  const loginUrl = `${credentials.endpoint}/login`;
  
  try {
    console.log(`🔐 Requesting new token for empresa ${empresaId}...`);
    
    const response = await axiosInstance.post(loginUrl, {}, {
      headers: {
        'appkey': credentials.appKey,
        'username': credentials.username,
        'password': credentials.password
      }
    });

    const token = response.data.bearerToken || response.data.token;
    
    if (!token) {
      throw new Error('Token não encontrado na resposta do Sankhya');
    }

    tokenCache[cacheKey] = {
      token,
      expiresAt: Date.now() + (20 * 60 * 1000) // 20 minutos
    };

    console.log(`✅ Token obtained for empresa ${empresaId}`);
    return token;
  } catch (error: any) {
    console.error(`❌ Error obtaining token for empresa ${empresaId}:`, error.message);
    throw new Error(`Falha na autenticação Sankhya: ${error.message}`);
  }
}

export async function fazerRequisicaoAutenticada(
  credentials: SankhyaCredentials,
  empresaId: string,
  serviceName: string,
  payload: any
): Promise<any> {
  const token = await obterToken(credentials, empresaId);
  const url = `${credentials.endpoint}/gateway/v1/mge/service.sbr?serviceName=${serviceName}&outputType=json`;

  try {
    const response = await axiosInstance.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error: any) {
    // Se token expirou, limpar cache e tentar novamente
    if (error.response?.status === 401 || error.response?.status === 403) {
      delete tokenCache[empresaId];
      console.log('🔄 Token expired, retrying...');
      return fazerRequisicaoAutenticada(credentials, empresaId, serviceName, payload);
    }
    throw error;
  }
}

export async function consultarRegistros(
  credentials: SankhyaCredentials,
  empresaId: string,
  rootEntity: string,
  fields: string,
  criteria?: string
): Promise<any[]> {
  const payload = {
    requestBody: {
      dataSet: {
        rootEntity,
        includePresentationFields: "N",
        disableRowsLimit: true,
        entity: {
          fieldset: {
            list: fields
          }
        },
        ...(criteria && {
          criteria: {
            expression: {
              $: criteria
            }
          }
        })
      }
    }
  };

  const response = await fazerRequisicaoAutenticada(
    credentials,
    empresaId,
    'CRUDServiceProvider.loadRecords',
    payload
  );

  const entities = response.responseBody?.entities;
  
  if (!entities || !entities.entity) {
    return [];
  }

  const fieldNames = entities.metadata.fields.field.map((f: any) => f.name);
  const entityArray = Array.isArray(entities.entity) ? entities.entity : [entities.entity];

  return entityArray.map((rawEntity: any) => {
    const cleanObject: any = {};
    for (let i = 0; i < fieldNames.length; i++) {
      const fieldKey = `f${i}`;
      const fieldName = fieldNames[i];
      if (rawEntity[fieldKey]) {
        cleanObject[fieldName] = rawEntity[fieldKey].$;
      }
    }
    return cleanObject;
  });
}
