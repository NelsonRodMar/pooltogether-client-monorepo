import { Vault } from '@generationsoftware/hyperstructure-client-js'
import { useUserVaultDelegate } from '@generationsoftware/hyperstructure-react-hooks'
import { Intl } from '@shared/types'
import { Spinner } from '@shared/ui'
import { atom, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Address, isAddress } from 'viem'
import { useAccount } from 'wagmi'
import { DelegateModalView } from '../Modals/DelegateModal'
import { SimpleInput } from './SimpleInput'

export const delegateFormNewDelegateAddressAtom = atom<Address | undefined>('0x')

interface DelegateFormValues {
  newDelegateAddress: Address | undefined
}

export interface DelegateFormProps {
  vault: Vault
  modalView: DelegateModalView
  intl?: {
    base?: Intl<'changeDelegateAddress' | 'delegatedAddress'>
    errors?: Intl<'formErrors.invalidAddress' | 'formErrors.sameAsDelegate'>
  }
}

export const DelegateForm = (props: DelegateFormProps) => {
  const { vault, modalView, intl } = props

  const { address: userAddress } = useAccount()

  const { data: delegate, isFetched: isFetchedDelegate } = useUserVaultDelegate(
    vault,
    userAddress as Address,
    { refetchOnWindowFocus: true }
  )

  const formMethods = useForm<DelegateFormValues>({ mode: 'onChange' })
  const { newDelegateAddress } = formMethods.watch()
  const { setValue } = formMethods

  const setFormNewDelegateAddressAtom = useSetAtom(delegateFormNewDelegateAddressAtom)

  const disabled = modalView === 'confirming' || modalView === 'waiting'

  const [isActiveOverride, setIsActiveOverride] = useState<boolean>(false)

  useEffect(() => {
    setIsActiveOverride(false)
    setValue('newDelegateAddress', undefined)
  }, [delegate])

  useEffect(() => {
    setFormNewDelegateAddressAtom(newDelegateAddress)
  }, [newDelegateAddress])

  if (!isFetchedDelegate) {
    return <Spinner />
  }

  return (
    <div className='flex flex-col'>
      <FormProvider {...formMethods}>
        <SimpleInput
          formKey='newDelegateAddress'
          autoComplete='off'
          disabled={disabled}
          validate={{
            isValidAddress: (v: string) =>
              isAddress(v?.trim()) ||
              (intl?.errors?.('formErrors.invalidAddress') ?? `Enter a valid EVM address`),
            isSameAsDelegate: (v: string) =>
              v?.trim() !== delegate ||
              (intl?.errors?.('formErrors.sameAsDelegate') ??
                `Address entered is same as current delegate`)
          }}
          placeholder={delegate}
          label={intl?.base?.('delegatedAddress') ?? `Delegated Address`}
          isActiveOverride={isActiveOverride}
          setIsActiveOverride={setIsActiveOverride}
          needsOverride={true}
          overrideLabel={intl?.base?.('changeDelegateAddress') ?? `Change Delegate Address`}
          keepValueOnOverride={true}
          className='w-full max-w-md'
        />
      </FormProvider>
    </div>
  )
}
