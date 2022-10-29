export default function splitUsername(username: string) {
    const lastIndex = username.lastIndexOf("#");

    const name = username.slice(0, lastIndex);
    const id = username.slice(lastIndex + 1);

    return { name, id };
}
