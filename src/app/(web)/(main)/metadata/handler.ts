/** @format */

import AxiosClient from "@/lib/axios";

export async function MetadataListService() {
  try {
    const { data: response } = await AxiosClient.get("/metadata/list");

    // Backend returns { status: true/false, message, data }
    const { status, message, data } = response;

    if (status === true || status === "true") {
      return {
        status: 200,
        message,
        data,
      };
    } else {
      throw new Error(message || "Failed to fetch metadata");
    }
  } catch (error: any) {
    console.log(error);
    throw error;
  }
}

export async function MetadataDetailService(id: string) {
  try {
    const { data: response } = await AxiosClient.get(`/metadata/detail/${id}`);

    // Backend returns { status: true/false, message, data }
    const { status, message, data } = response;

    if (status === true || status === "true") {
      return {
        status: 200,
        message,
        data,
      };
    } else {
      throw new Error(message || "Failed to fetch metadata");
    }
  } catch (error: any) {
    console.log(error);
    throw error;
  }
}

export async function MetadataByPageService(page: string) {
  try {
    const { data: response } = await AxiosClient.get(
      `/metadata/detail?page=${page}`
    );

    // Backend returns { status: true/false, message, data }
    const { status, message, data } = response;

    if (status === true || status === "true") {
      return {
        status: 200,
        message,
        data,
      };
    } else {
      throw new Error(message || "Failed to fetch metadata");
    }
  } catch (error: any) {
    console.log(error);
    throw error;
  }
}

export async function CreateMetadata(payload: any) {
  try {
    const { data: response } = await AxiosClient.post("/metadata/add", payload);

    const { status, message, data } = response;

    if (status !== 201) throw new Error(message);

    return {
      status,
      message,
      data,
    };
  } catch (error: any) {
    console.log(error);
    return error?.response?.data;
  }
}

export async function UpdateMetadata(id: string, payload: any) {
  try {
    const { data: response } = await AxiosClient.put(
      `/metadata/adjust/${id}`,
      payload
    );

    const { status, message, data } = response;

    if (status !== 200) throw new Error(message);

    return {
      status,
      message,
      data,
    };
  } catch (error: any) {
    console.log(error);
    return error?.response?.data;
  }
}

export async function PublishMetadata(id: string, status: string) {
  try {
    const { data: response } = await AxiosClient.put(
      `/metadata/publish/${id}`,
      { status }
    );

    const { status: responseStatus, message, data } = response;

    if (responseStatus !== 200) throw new Error(message);

    return {
      status: responseStatus,
      message,
      data,
    };
  } catch (error: any) {
    console.log(error);
    return error?.response?.data;
  }
}

export async function DeleteMetadata(id: string) {
  try {
    const { data: response } = await AxiosClient.delete(
      `/metadata/takedown/${id}`
    );

    const { status, message } = response;

    if (status !== 200) throw new Error(message);

    return {
      status,
      message,
    };
  } catch (error: any) {
    console.log(error);
    return error?.response?.data;
  }
}
