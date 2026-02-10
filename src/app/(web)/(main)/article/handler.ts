/** @format */

import AxiosClient from "@/lib/axios";

const headers = {
  headers: {
    "Content-Type": "multipart/form-data",
  },
};

interface ArticleListParams {
  page?: number;
  category?: string;
  search?: string;
  tag?: string;
  status?: string;
  sort_order?: string;
}

export async function ArticleListService(params: ArticleListParams = {}) {
  try {
    const queryParams = new URLSearchParams();

    if (params.page) {
      queryParams.append("page", params.page.toString());
    }

    if (params.category) {
      queryParams.append("category", params.category);
    }

    if (params.search) {
      queryParams.append("search", params.search);
    }

    if (params.tag) {
      queryParams.append("tag", params.tag);
    }

    if (params.status) {
      queryParams.append("status", params.status);
    }

    if (params.sort_order) {
      queryParams.append("sort_order", params.sort_order);
    }

    const queryString = queryParams.toString();
    const url = `/article/list${queryString ? `?${queryString}` : ""}`;

    const { data: response } = await AxiosClient.get(url);

    const { status, message, data, pagination } = response;

    if (status !== 200) throw new Error(message);

    return {
      status,
      message,
      data: {
        data,
        pagination,
      },
    };
  } catch (error: any) {
    console.log(error);
    throw error;
  }
}

export async function ArticleDetailService(id: string) {
  try {
    const { data: response } = await AxiosClient.get(`/article/detail/${id}`);

    const { status, message, data } = response;

    if (status !== 200) throw new Error(message);

    return {
      status,
      message,
      data,
    };
  } catch (error: any) {
    console.log(error);
    return error.message;
  }
}

export async function CreateArticleService(payload: any) {
  try {
    const { data: response } = await AxiosClient.post(
      "/article/add",
      payload,
      headers
    );

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

export async function UpdateArticleService(id: string, payload: any) {
  try {
    const { data: response } = await AxiosClient.put(
      `/article/adjust/${id}`,
      payload,
      headers
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

export async function DeleteArticleService(payload: string) {
  try {
    const { data: response } = await AxiosClient.delete(
      `/article/takedown/${payload}`
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
