// src/shared/ipfs-client/src/index.ts
import pinataSDK, { PinataPinOptions } from '@pinata/sdk';
import fs from 'fs';
import path from 'path';

export interface VersoriumXIpfsMetadata extends PinataPinOptions {
  name: string;
  keyvalues?: {
    [key: string]: string | number | boolean;
    versoriumx_project: string; // Ensure this tag is always present
    versoriumx_version: string; // Link to project version
    timestamp: string; // Add upload timestamp
  };
}

export class VersoriumXPinataClient {
  private pinata: pinataSDK;
  private projectBaseMetadata: { versoriumx_project: string, versoriumx_version: string };

  constructor(
    apiKey: string,
    secretKey: string,
    projectBaseMetadata: { project: string, version: string } // e.g., { project: "VersoriumX", version: "0.1.0" }
  ) {
    if (!apiKey || !secretKey) {
      throw new Error("Pinata API Key and Secret Key are required.");
    }
    this.pinata = new pinataSDK(apiKey, secretKey);
    this.projectBaseMetadata = {
      versoriumx_project: projectBaseMetadata.project,
      versoriumx_version: projectBaseMetadata.version
    };
    console.log(`VersoriumX Pinata Client initialized for project: ${projectBaseMetadata.project}`);
  }

  /**
   * Generates common metadata for VersoriumX uploads.
   * @param customName Custom name for the IPFS content.
   * @param additionalKeyvalues Any extra key-value pairs for Pinata.
   * @returns PinataPinOptions with VersoriumX specific metadata.
   */
  private getCommonPinOptions(customName: string, additionalKeyvalues?: { [key: string]: string | number | boolean }): PinataPinOptions {
    return {
      pinataMetadata: {
        name: customName,
        keyvalues: {
          ...this.projectBaseMetadata,
          timestamp: new Date().toISOString(),
          ...additionalKeyvalues
        }
      }
    };
  }

  /**
   * Uploads JSON data to Pinata.
   * @param data The JSON object to upload.
   * @param name A unique name for this content on Pinata.
   * @param additionalKeyvalues Optional key-value pairs to add to Pinata metadata.
   * @returns The IPFS CID of the uploaded JSON.
   */
  async uploadJson(
    data: object,
    name: string,
    additionalKeyvalues?: { [key: string]: string | number | boolean }
  ): Promise<string> {
    const options = this.getCommonPinOptions(name, additionalKeyvalues);
    try {
      const result = await this.pinata.pinJSONToIPFS(data, options);
      console.log(`JSON '${name}' uploaded to IPFS. CID: ${result.IpfsHash}`);
      return result.IpfsHash;
    } catch (error) {
      console.error(`Error uploading JSON '${name}':`, error);
      throw new Error(`Failed to upload JSON to Pinata: ${error.message || error}`);
    }
  }

  /**
   * Uploads a single file to Pinata.
   * @param filePath The absolute path to the file.
   * @param name A unique name for this content on Pinata.
   * @param additionalKeyvalues Optional key-value pairs to add to Pinata metadata.
   * @returns The IPFS CID of the uploaded file.
   */
  async uploadFile(
    filePath: string,
    name: string,
    additionalKeyvalues?: { [key: string]: string | number | boolean }
  ): Promise<string> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found at path: ${filePath}`);
    }

    const readableStreamForFile = fs.createReadStream(filePath);
    const options = this.getCommonPinOptions(name, additionalKeyvalues);

    try {
      const result = await this.pinata.pinFileToIPFS(readableStreamForFile, options);
      console.log(`File '${name}' uploaded to IPFS. CID: ${result.IpfsHash}`);
      return result.IpfsHash;
    } catch (error) {
      console.error(`Error uploading file '${name}':`, error);
      throw new Error(`Failed to upload file to Pinata: ${error.message || error}`);
    }
  }

  /**
   * Uploads an entire directory to Pinata.
   * @param directoryPath The absolute path to the directory.
   * @param name A unique name for this directory on Pinata (optional, defaults to directory name).
   * @param additionalKeyvalues Optional key-value pairs to add to Pinata metadata.
   * @returns The IPFS CID of the uploaded directory.
   */
  async uploadDirectory(
    directoryPath: string,
    name?: string,
    additionalKeyvalues?: { [key: string]: string | number | boolean }
  ): Promise<string> {
    if (!fs.existsSync(directoryPath) || !fs.statSync(directoryPath).isDirectory()) {
      throw new Error(`Directory not found or not a directory at path: ${directoryPath}`);
    }

    const directoryName = name || path.basename(directoryPath);
    const options = this.getCommonPinOptions(directoryName, {
      ...additionalKeyvalues,
      type: 'directory' // Explicitly mark as directory upload
    });

    try {
      // Pinata SDK expects path without fs.createReadStream for directories
      const result = await this.pinata.pinFromFS(directoryPath, options);
      console.log(`Directory '${directoryName}' uploaded to IPFS. CID: ${result.IpfsHash}`);
      return result.IpfsHash;
    } catch (error) {
      console.error(`Error uploading directory '${directoryName}':`, error);
      throw new Error(`Failed to upload directory to Pinata: ${error.message || error}`);
    }
  }

  /**
   * Checks if Pinata API keys are valid.
   */
  async testAuthentication(): Promise<boolean> {
    try {
      const result = await this.pinata.testAuthentication();
      return result.authenticated;
    } catch (error) {
      console.error("Pinata authentication failed:", error);
      return false;
    }
  }
}

export function greet(name: string): string {
  return `Hello, ${name} from VersoriumX IPFS Client!`;
}

export class CustomClient {
  private config: { apiKey: string, secretKey: string };

  constructor(apiKey: string, secretKey: string) {
    if (!apiKey || !secretKey) {
      throw new Error("API Key and Secret Key are required.");
    }
    this.config = { apiKey, secretKey };
    console.log("Custom IPFS client initialized.");
  }

  ping(): string {
    return `Client active with config for API: ${this.config.apiKey.substring(0, 5)}...`;
  }
}
