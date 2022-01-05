const { to } = require('await-to-js');
const pe = require('parse-error');

module.exports.to = async (promise) =>
{
  let err, res;
  [err, res] = await to(promise);
  if (err) return [err];

  return [null, res];
};

module.exports.ReE = function (res, err, code)
{ // Error Web Response
  if (typeof err == 'object' && typeof err.message != 'undefined')
  {
    err = err.message;
  }

  if (typeof code !== 'undefined') res.statusCode = code;

  return res.json({ success: false, error: err });
};

module.exports.ReS = function (res, data, code)
{ // Success Web Response
  let send_data = { success: true };

  if (typeof data == 'object')
  {
    send_data = Object.assign(data, send_data);//merge the objects
  }

  if (typeof code !== 'undefined') res.statusCode = code;

  return res.json(send_data)
};

module.exports.TE = TE = function (err_message, log)
{ // TE stands for Throw Error
  if (log === true)
  {
    console.error(err_message);
  }

  throw new Error(err_message);
};

module.exports.FilterUser = function (userobject)
{
  if (userobject != null)
  {
    delete userobject["creation_date"];
    delete userobject["last_modified"];
    delete userobject["password"];
    delete userobject["last_seen_post"];
    delete userobject["email"];
    // delete userobject["image"];
    // userobject["image_url"] = "/users/image/" + userobject["id"];

  }
  return userobject;
};

module.exports.MakeArrayUnique = function (a)
{
  var obj = {};

  for (var i = 0, len = a.length; i < len; i++)
    obj[a[i].id] = a[i];

  a = new Array();
  for (var key in obj)
    a.push(obj[key]);

  return a;
};

module.exports.Sleep = function (millis)
{
  return new Promise(resolve => setTimeout(resolve, millis));
}