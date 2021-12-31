import get from 'lodash/get';
// keeping this simple and static;
const API_ACCESS_TOKEN = '3be9756b0634916c706e009fac5ece27';

const authenticateToken = async (req, res, next) => {
  let response;
  const gbAccessToken = get(
    req.headers,
    'gb-access-token',
    get(req.headers, 'GB-Access-Token', ''),
  );
  if (gbAccessToken === API_ACCESS_TOKEN) {
    try {
      req.isAuthorized = true;
      next();
    } catch (err) {
      throw new Error(err);
    }
  } else {
    response = {
      success: false,
      error: 'Authentication error: a token is required.',
    };
    res.status(401).json(response);
  }
};

export default authenticateToken;
