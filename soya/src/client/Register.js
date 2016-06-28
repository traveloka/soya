/**
 * No-operation, since we don't need to register pages in Server.
 *
 * TODO: Update documentation.
 *
 * @SERVER
 * @param {string} filename
 * @param {Page} pageClass
 */
export default function register(pageClass, filename) {
  pageClass.__filename = filename;
}