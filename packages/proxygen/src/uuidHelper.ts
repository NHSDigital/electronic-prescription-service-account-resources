import {v4 as uuidv4} from "uuid"

// this is a separate function to allow it to be mocked

export function returnUuid() {
  return uuidv4()
}
