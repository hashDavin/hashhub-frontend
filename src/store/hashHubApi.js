import { createApi } from '@reduxjs/toolkit/query/react'
import rtkQueryClient from '@/services/rtkQueryClient'
import { unwrapData, unwrapPaginated } from '@/utils/api'

async function axiosBaseQuery({ url, method = 'get', data, params, headers }) {
  try {
    const result = await rtkQueryClient({ url, method, data, params, headers })
    return { data: result.data }
  } catch (err) {
    const status = err.response?.status
    const resData = err.response?.data
    return { error: { status, data: resData } }
  }
}

function normalizePaginatedResponse(body) {
  return unwrapPaginated({ data: body })
}

export const hashHubApi = createApi({
  reducerPath: 'hashHubApi',
  baseQuery: axiosBaseQuery,
  tagTypes: ['User', 'Project'],
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: (params) => ({ url: '/users', method: 'get', params }),
      transformResponse: (response) => normalizePaginatedResponse(response),
      providesTags: (result) =>
        result?.items?.length
          ? [...result.items.map(({ id }) => ({ type: 'User', id })), { type: 'User', id: 'LIST' }]
          : [{ type: 'User', id: 'LIST' }],
    }),
    toggleUserStatus: builder.mutation({
      query: (id) => ({ url: `/users/${id}/status`, method: 'patch' }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),
    createUser: builder.mutation({
      query: (body) => ({ url: '/users', method: 'post', data: body }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),
    updateUser: builder.mutation({
      query: ({ id, body }) => ({
        url: `/users/${id}?_method=PUT`,
        method: 'post',
        data: body,
      }),
      invalidatesTags: (result, err, { id }) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({ url: `/users/${id}`, method: 'delete' }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),
    getProjects: builder.query({
      query: (params) => ({ url: '/projects', method: 'get', params }),
      transformResponse: (response) => normalizePaginatedResponse(response),
      providesTags: (result) =>
        result?.items?.length
          ? [
              ...result.items.map(({ id }) => ({ type: 'Project', id })),
              { type: 'Project', id: 'LIST' },
            ]
          : [{ type: 'Project', id: 'LIST' }],
    }),
    getProject: builder.query({
      query: (id) => ({ url: `/projects/${id}`, method: 'get' }),
      transformResponse: (response) => unwrapData({ data: response }),
      providesTags: (result, error, id) => [{ type: 'Project', id }],
    }),
    createProject: builder.mutation({
      query: (body) => ({ url: '/projects', method: 'post', data: body }),
      invalidatesTags: [{ type: 'Project', id: 'LIST' }],
    }),
    updateProject: builder.mutation({
      query: ({ id, body }) => ({ url: `/projects/${id}`, method: 'put', data: body }),
      invalidatesTags: (result, err, { id }) => [
        { type: 'Project', id },
        { type: 'Project', id: 'LIST' },
      ],
    }),
    toggleProjectStatus: builder.mutation({
      query: (id) => ({ url: `/projects/${id}/status`, method: 'patch' }),
      invalidatesTags: (result, err, id) => [
        { type: 'Project', id },
        { type: 'Project', id: 'LIST' },
      ],
    }),
    deleteProject: builder.mutation({
      query: (id) => ({ url: `/projects/${id}`, method: 'delete' }),
      invalidatesTags: [{ type: 'Project', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetUsersQuery,
  useToggleUserStatusMutation,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useToggleProjectStatusMutation,
  useDeleteProjectMutation,
} = hashHubApi
