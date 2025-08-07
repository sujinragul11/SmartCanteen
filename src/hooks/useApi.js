import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const useApi = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    immediate = true,
    onSuccess,
    onError,
    showErrorToast = true,
    showSuccessToast = false
  } = options;

  const execute = useCallback(async (config = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios({
        url,
        method: 'GET',
        ...config
      });

      setData(response.data);
      
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      if (showSuccessToast && response.data.message) {
        toast.success(response.data.message);
      }

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred';
      setError(errorMessage);
      
      if (onError) {
        onError(err);
      }
      
      if (showErrorToast) {
        toast.error(errorMessage);
      }

      throw err;
    } finally {
      setLoading(false);
    }
  }, [url, onSuccess, onError, showErrorToast, showSuccessToast]);

  useEffect(() => {
    if (immediate && url) {
      execute();
    }
  }, [execute, immediate, url]);

  const refetch = useCallback(() => {
    return execute();
  }, [execute]);

  return {
    data,
    loading,
    error,
    execute,
    refetch
  };
};

// Hook for POST requests
export const useApiPost = (url, options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    onSuccess,
    onError,
    showErrorToast = true,
    showSuccessToast = true
  } = options;

  const execute = useCallback(async (data, config = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios({
        url,
        method: 'POST',
        data,
        ...config
      });

      if (onSuccess) {
        onSuccess(response.data);
      }
      
      if (showSuccessToast && response.data.message) {
        toast.success(response.data.message);
      }

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred';
      setError(errorMessage);
      
      if (onError) {
        onError(err);
      }
      
      if (showErrorToast) {
        toast.error(errorMessage);
      }

      throw err;
    } finally {
      setLoading(false);
    }
  }, [url, onSuccess, onError, showErrorToast, showSuccessToast]);

  return {
    loading,
    error,
    execute
  };
};

// Hook for PUT requests
export const useApiPut = (url, options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    onSuccess,
    onError,
    showErrorToast = true,
    showSuccessToast = true
  } = options;

  const execute = useCallback(async (data, config = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios({
        url,
        method: 'PUT',
        data,
        ...config
      });

      if (onSuccess) {
        onSuccess(response.data);
      }
      
      if (showSuccessToast && response.data.message) {
        toast.success(response.data.message);
      }

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred';
      setError(errorMessage);
      
      if (onError) {
        onError(err);
      }
      
      if (showErrorToast) {
        toast.error(errorMessage);
      }

      throw err;
    } finally {
      setLoading(false);
    }
  }, [url, onSuccess, onError, showErrorToast, showSuccessToast]);

  return {
    loading,
    error,
    execute
  };
};

// Hook for DELETE requests
export const useApiDelete = (url, options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    onSuccess,
    onError,
    showErrorToast = true,
    showSuccessToast = true
  } = options;

  const execute = useCallback(async (config = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios({
        url,
        method: 'DELETE',
        ...config
      });

      if (onSuccess) {
        onSuccess(response.data);
      }
      
      if (showSuccessToast && response.data.message) {
        toast.success(response.data.message);
      }

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred';
      setError(errorMessage);
      
      if (onError) {
        onError(err);
      }
      
      if (showErrorToast) {
        toast.error(errorMessage);
      }

      throw err;
    } finally {
      setLoading(false);
    }
  }, [url, onSuccess, onError, showErrorToast, showSuccessToast]);

  return {
    loading,
    error,
    execute
  };
};

export default useApi;