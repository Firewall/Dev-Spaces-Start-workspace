import { useState } from 'react'
import {
  ExpandableSection,
  FormGroup,
  Grid,
  GridItem,
  Popover,
  TextInput,
} from '@patternfly/react-core'
import { HelpIcon } from '@patternfly/react-icons'

interface EnvSettings {
  containerImage: string
  memoryLimit: string
  cpuLimit: string
  devfilePath: string
}

interface EnvironmentSettingsProps {
  value: EnvSettings
  onChange: (val: EnvSettings) => void
}

function FieldHelp({ text }: { text: string }) {
  return (
    <Popover bodyContent={text}>
      <button
        type="button"
        aria-label="More info"
        onClick={(e) => e.preventDefault()}
        className="pf-v6-c-form__group-label-help"
      >
        <HelpIcon />
      </button>
    </Popover>
  )
}

export function EnvironmentSettings({ value, onChange }: EnvironmentSettingsProps) {
  const [expanded, setExpanded] = useState(false)

  function update(partial: Partial<EnvSettings>) {
    onChange({ ...value, ...partial })
  }

  return (
    <ExpandableSection
      toggleText="Advanced Settings"
      isExpanded={expanded}
      onToggle={(_e, isExpanded) => setExpanded(isExpanded)}
    >
      <FormGroup
        label="Path to Devfile"
        fieldId="devfile-path"
        labelHelp={<FieldHelp text="Specify a custom path to your devfile. Overrides the default search for devfile.yaml or .devfile.yaml in the repository root." />}
      >
        <TextInput
          id="devfile-path"
          value={value.devfilePath}
          onChange={(_e, val) => update({ devfilePath: val })}
          placeholder="devfile.yaml"
        />
      </FormGroup>

      <FormGroup
        label="Container Image"
        fieldId="container-image"
        labelHelp={<FieldHelp text="Override the default Universal Developer Image. Specify a custom container image for your workspace runtime." />}
      >
        <TextInput
          id="container-image"
          value={value.containerImage}
          onChange={(_e, val) => update({ containerImage: val })}
          placeholder="quay.io/devspaces/udi:latest"
        />
      </FormGroup>

      <Grid hasGutter>
        <GridItem span={6}>
          <FormGroup
            label="Memory Limit"
            fieldId="memory-limit"
            labelHelp={<FieldHelp text="Set the maximum RAM allocation for this workspace. Use Kubernetes resource quantity formats, e.g. 4Gi, 512Mi." />}
          >
            <TextInput
              id="memory-limit"
              value={value.memoryLimit}
              onChange={(_e, val) => update({ memoryLimit: val })}
              placeholder="4Gi"
            />
          </FormGroup>
        </GridItem>
        <GridItem span={6}>
          <FormGroup
            label="CPU Limit"
            fieldId="cpu-limit"
            labelHelp={<FieldHelp text="Set the maximum CPU allocation. Use cores (e.g. 2) or millicores (e.g. 2000m)." />}
          >
            <TextInput
              id="cpu-limit"
              value={value.cpuLimit}
              onChange={(_e, val) => update({ cpuLimit: val })}
              placeholder="2"
            />
          </FormGroup>
        </GridItem>
      </Grid>
    </ExpandableSection>
  )
}
