import Load from 'soya/lib/data/redux/Load';
import {
  CONTENT_RESOURCE_SERVICE,
  CONTENT_RESOURCE_SEGMENT,
  FETCH_CONTENT_RESOURCE,
} from '../constants/ContentResourceConstant';

const fetchContentResource = (query, data) => ({
  type: FETCH_CONTENT_RESOURCE,
  query,
  data
});

export const load = (query, queryId, segmentState) => {
  const load = new Load(CONTENT_RESOURCE_SEGMENT);
  load.func = (dispatch, queryFunc, services) => {
    const service = services[CONTENT_RESOURCE_SERVICE];
    return service.fetchContentResource(query)
      .then(({ data }) => {
        dispatch(fetchContentResource(query, data));
      });
  };
  return load;
};
