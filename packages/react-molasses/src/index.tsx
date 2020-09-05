import * as React from "react"
import * as MolassesJS from "@molassesapp/molasses-js"
import { User } from "@molassesapp/common"
export interface IMolassesProviderProps {}

export const MolassesContext = React.createContext<MolassesJS.MolassesClient>(undefined)
export const MolassesProvider = ({
  client,
  children,
}: {
  client: MolassesJS.MolassesClient
  children: React.ReactNode
}) => {
  return <MolassesContext.Provider value={client}>{children}</MolassesContext.Provider>
}

export const useFeature = (name: string, user?: User): boolean => {
  const client = React.useContext(MolassesContext)
  return client.isActive(name, user)
}

export const useMolasses = () => {
  return React.useContext(MolassesContext)
}

export function Feature({
  name,
  user,
  children,
  render = children,
}: {
  name: string
  user?: User
  children?: React.ReactNode | ((isActive: boolean) => JSX.Element)
  render?: React.ReactNode | ((isActive: boolean) => JSX.Element)
}) {
  const isActive = useFeature(name, user)
  if (typeof render === "function") return render(isActive)
  if (!isActive) return null
  return render
}

export function withMolasses(Component: Function) {
  return (props: React.ComponentProps<any>) => {
    const molasses = useMolasses()
    return <Component {...props} molasses={molasses} />
  }
}
