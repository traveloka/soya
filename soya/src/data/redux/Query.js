/**
 * Represents a specific Query to a Segment.
 *
 * @CLIENT_SERVER
 */
export default class Query {
  getId() {
    throw new Error('Query must implement ');
  }

  extract(segmentState) {
    throw new Error('Query must implement ');
  }

  createLoadAction(segmentState, services) {
    // Default query implementation does not convert to load action.
    return null;
  }
}