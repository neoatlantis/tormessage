/*
 * This is a special module in the system. This module exposes the managing
 * functionalities into the darknet under path `/admin`, but should be
 * protected with a username/password combination defined in `sys/config.js`,
 * and can also be fully disabled in the same config file.
 *
 * The darknet, specifically Tor and i2p, provides peer-to-peer encryption,
 * so even without HTTPS, it's safe to use WWW-Authentication in plaintext.
 *
 * This single page allows user to do things using any browser connected to
 * the darknet without their own computer. Therefore the static page displayed
 * works like the desktop interface. This should be achieved by implementing
 * an API under `/admin` to proxify browser operations into internal events,
 * and by writing a relative comprehensive single page app to facilitate the
 * same job, since in other ways we would have to tell other modules to merge 
 * their functionalities into the admin module.
 */

module.exports = function(e){ 

e.net.page('/', 'admin.html');
e.net.api('/', function(e){
//////////////////////////////////////////////////////////////////////////////

e.response(200, 'hello admin');

//////////////////////////////////////////////////////////////////////////////
}); };
